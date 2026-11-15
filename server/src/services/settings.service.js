import { Setting } from '../models/Setting.js';

export const DEFAULT_SETTINGS = {
  clinicName: 'Serenova Clinic',
  clinicTimezone: 'Asia/Karachi',
  bookingMaxDaysAhead: 60,
  minNoticeHours: 2,
  cancelCutoffHours: 24
};

export async function getSettings() {
  const rows = await Setting.find({}).lean();
  return rows.reduce((result, row) => ({ ...result, [row.key]: row.value }), { ...DEFAULT_SETTINGS });
}

export async function getSetting(key) {
  const row = await Setting.findOne({ key }).lean();
  return row ? row.value : DEFAULT_SETTINGS[key];
}

export async function updateSettings(values, userId) {
  await Promise.all(Object.entries(values).map(([key, value]) => Setting.findOneAndUpdate(
    { key }, { $set: { value, updatedBy: userId } }, { upsert: true }
  )));
  return getSettings();
}

export async function seedDefaults() {
  await Promise.all(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => Setting.updateOne(
    { key }, { $setOnInsert: { key, value } }, { upsert: true }
  )));
}
