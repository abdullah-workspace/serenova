import request from 'supertest';
import crypto from 'node:crypto';
import { DateTime } from 'luxon';
import { app } from '../src/app.js';
import { Department } from '../src/models/Department.js';
import { Doctor } from '../src/models/Doctor.js';
import { Schedule } from '../src/models/Schedule.js';
import { ContactMessage } from '../src/models/ContactMessage.js';
import { Appointment } from '../src/models/Appointment.js';
import { getSlots } from '../src/services/slots.service.js';

const futureDate = DateTime.now().setZone('Asia/Karachi').plus({ days: 14 }).toISODate();
const day = DateTime.fromISO(futureDate, { zone: 'Asia/Karachi' }).weekday % 7;

let department;
let doctor;

beforeEach(async () => {
  department = await Department.create({ name: 'Test Care', slug: 'test-care', description: 'Test', commonConditions: ['Test'] });
  doctor = await Doctor.create({
    departmentId: department._id,
    name: 'Dr. Test Doctor',
    initials: 'TD',
    specialty: 'Tester',
    qualifications: ['MBBS'],
    languages: ['English'],
    availableDays: ['Mon to Sat'],
    slotMinutes: 30
  });
  await Schedule.create({
    doctorId: doctor._id,
    weekly: [{ day, start: '09:00', end: '12:00', breaks: [{ start: '10:00', end: '10:30' }] }],
    daysOff: [{ date: DateTime.fromISO(futureDate).plus({ days: 1 }).toISODate(), reason: 'Closed' }]
  });
});

function payload(startAt, email = 'patient@example.com') {
  return {
    visitType: 'new',
    departmentId: String(department._id),
    doctorId: String(doctor._id),
    startAt,
    fullName: 'Test Patient',
    phone: '+92 300 0000000',
    email,
    dateOfBirth: '1990-01-01',
    reason: 'A routine appointment request',
    consent: true
  };
}

test('slots skip breaks and days off', async () => {
  const slots = await getSlots(doctor._id, futureDate);
  expect(slots.map((slot) => slot.label)).toEqual(['09:00', '09:30', '10:30', '11:00', '11:30']);
  const dayOff = DateTime.fromISO(futureDate).plus({ days: 1 }).toISODate();
  expect(await getSlots(doctor._id, dayOff)).toEqual([]);
  await expect(getSlots(doctor._id, DateTime.now().setZone('Asia/Karachi').minus({ days: 1 }).toISODate())).rejects.toMatchObject({ code: 'PAST_DATE' });
  await expect(getSlots(doctor._id, DateTime.now().setZone('Asia/Karachi').plus({ days: 61 }).toISODate())).rejects.toMatchObject({ code: 'DATE_TOO_FAR' });
});

test('booking succeeds, returns a reference, and rejects invalid input', async () => {
  const slot = (await getSlots(doctor._id, futureDate))[0];
  const response = await request(app).post('/api/v1/appointments').send(payload(slot.startAt));
  expect(response.status).toBe(201);
  expect(response.body.data.reference).toMatch(/^APT-\d{4}-\d{5}$/);
  const invalid = await request(app).post('/api/v1/appointments').send({});
  expect(invalid.status).toBe(400);
  expect(invalid.body.error.code).toBe('VALIDATION');
  expect(invalid.body.error.fields.fullName).toBeTruthy();
});

test('a slot outside the generated list is rejected', async () => {
  const outsideSchedule = DateTime.fromISO(`${futureDate}T09:15`, { zone: 'Asia/Karachi' }).toUTC().toISO();
  const response = await request(app).post('/api/v1/appointments').send(payload(outsideSchedule));
  expect(response.status).toBe(409);
  expect(response.body.error.code).toBe('SLOT_UNAVAILABLE');
});

test('double booking produces one success and one conflict', async () => {
  const slot = (await getSlots(doctor._id, futureDate))[1];
  const responses = await Promise.all([
    request(app).post('/api/v1/appointments').send(payload(slot.startAt, 'one@example.com')),
    request(app).post('/api/v1/appointments').send(payload(slot.startAt, 'two@example.com'))
  ]);
  expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
  expect(responses.filter((response) => response.status === 409 && response.body.error.code === 'SLOT_TAKEN')).toHaveLength(1);
});

test('wrong lookup token returns 404 and cancellation frees a slot', async () => {
  const slot = (await getSlots(doctor._id, futureDate))[0];
  const created = await request(app).post('/api/v1/appointments').send(payload(slot.startAt));
  const { reference, manageToken } = created.body.data;
  const wrong = await request(app).get(`/api/v1/appointments/lookup?ref=${reference}&token=${'0'.repeat(64)}`);
  expect(wrong.status).toBe(404);
  const cancelled = await request(app).patch(`/api/v1/appointments/${reference}/cancel`).send({ token: manageToken });
  expect(cancelled.status).toBe(200);
  const bookedAgain = await request(app).post('/api/v1/appointments').send(payload(slot.startAt, 'again@example.com'));
  expect(bookedAgain.status).toBe(201);
});

test('rescheduling moves the visit', async () => {
  const slots = await getSlots(doctor._id, futureDate);
  const created = await request(app).post('/api/v1/appointments').send(payload(slots[0].startAt));
  const moved = await request(app).patch(`/api/v1/appointments/${created.body.data.reference}/reschedule`).send({
    token: created.body.data.manageToken,
    startAt: slots[1].startAt
  });
  expect(moved.status).toBe(200);
  expect(new Date(moved.body.data.startAt).toISOString()).toBe(new Date(slots[1].startAt).toISOString());
});

test('cancellation inside the cutoff returns TOO_LATE', async () => {
  const token = 'a'.repeat(64);
  const startAt = DateTime.utc().plus({ hours: 1 }).toJSDate();
  await Appointment.create({
    reference: 'APT-2099-99999',
    guest: { fullName: 'Soon Patient', phone: '03000000000', email: 'soon@example.com', dateOfBirth: '1990-01-01' },
    doctorId: doctor._id,
    departmentId: department._id,
    startAt,
    endAt: DateTime.fromJSDate(startAt).plus({ minutes: 30 }).toJSDate(),
    visitType: 'new',
    consentAt: new Date(),
    cancelTokenHash: crypto.createHash('sha256').update(token).digest('hex')
  });
  const response = await request(app).patch('/api/v1/appointments/APT-2099-99999/cancel').send({ token });
  expect(response.status).toBe(409);
  expect(response.body.error.code).toBe('TOO_LATE');
});

test('contact saves a message', async () => {
  const response = await request(app).post('/api/v1/contact').send({
    name: 'Test Patient',
    email: 'patient@example.com',
    subject: 'Appointments',
    message: 'I would like to ask about available appointments.'
  });
  expect(response.status).toBe(201);
  expect(await ContactMessage.countDocuments()).toBe(1);
});

test('rate limiter returns 429 after the appointment limit', async () => {
  const requests = Array.from({ length: 11 }, () => request(app).post('/api/v1/appointments').send({}));
  const responses = await Promise.all(requests);
  expect(responses.at(-1).status).toBe(429);
});
