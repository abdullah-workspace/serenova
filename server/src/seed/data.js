export const departments = [
  ['Cardiology', 'Our cardiologists find the cause of heart symptoms and build a long-term plan to protect your heart.', ['Chest pain', 'high blood pressure', 'irregular heartbeat', 'heart failure']],
  ['Orthopedics', 'We treat bones, joints and muscles, and aim to get you moving again with the least invasive option that works.', ['Joint pain', 'fractures', 'sports injuries', 'arthritis', 'back and neck pain']],
  ['Pediatrics', 'Gentle care for babies, children and teenagers, with doctors who are used to nervous patients.', ['Fever', 'infections', 'growth concerns', 'allergies', 'vaccinations']],
  ['Neurology', 'We look for the cause of symptoms that affect the brain and nerves, and explain each finding step by step.', ['Headaches', 'migraine', 'dizziness', 'nerve pain', 'numbness', 'seizures']],
  ['Dermatology', 'Care for skin, hair and nails, from a persistent rash to a mole you want checked.', ['Acne', 'eczema', 'rashes', 'hair loss', 'fungal infections', 'skin allergies']],
  ['General medicine', 'Your first stop for everyday illness and ongoing conditions. We refer you to a specialist when you need one.', ['Fever', 'infections', 'diabetes', 'thyroid', 'stomach problems', 'general check-ups']],
  ['Gynecology', 'Private, respectful care for women at every stage, with female doctors available on request.', ['Period problems', 'pregnancy care', 'fertility questions', 'menopause']],
  ['ENT', 'Ear, nose and throat specialists who treat both quick problems and long-standing ones.', ['Ear infections', 'hearing loss', 'sinus trouble', 'throat pain', 'snoring']]
].map(([name, description, commonConditions]) => ({
  name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
  description,
  commonConditions
}));

export const doctors = [
  ['Dr. Amina Rahman', 'AR', 'Cardiology', 'Cardiologist', 'MBBS, FCPS (Cardiology)', ['English', 'Urdu', 'Punjabi'], ['Mon', 'Wed', 'Fri']],
  ['Dr. Hassan Qureshi', 'HQ', 'Orthopedics', 'Orthopedic surgeon', 'MBBS, FCPS (Orthopedics)', ['English', 'Urdu'], ['Tue', 'Thu', 'Sat']],
  ['Dr. Sana Iqbal', 'SI', 'Pediatrics', 'Pediatrician', 'MBBS, DCH, FCPS (Pediatrics)', ['English', 'Urdu', 'Pashto'], ['Mon to Sat']],
  ['Dr. Omar Farooq', 'OF', 'Neurology', 'Neurologist', 'MBBS, FCPS (Neurology)', ['English', 'Urdu'], ['Mon', 'Tue', 'Thu']],
  ['Dr. Mariam Siddiqui', 'MS', 'Dermatology', 'Dermatologist', 'MBBS, MCPS (Dermatology)', ['English', 'Urdu', 'Sindhi'], ['Tue', 'Wed', 'Sat']],
  ['Dr. Bilal Chaudhry', 'BC', 'General medicine', 'General physician', 'MBBS, MRCGP', ['English', 'Urdu', 'Punjabi'], ['Mon to Sat']],
  ['Dr. Hina Malik', 'HM', 'Gynecology', 'Gynecologist', 'MBBS, FCPS (Gynecology)', ['English', 'Urdu'], ['Mon', 'Wed', 'Thu']],
  ['Dr. Faisal Ahmed', 'FA', 'ENT', 'ENT specialist', 'MBBS, FCPS (ENT)', ['English', 'Urdu'], ['Tue', 'Fri', 'Sat']]
].map(([name, initials, department, specialty, qualification, languages, availableDays]) => ({
  name,
  initials,
  department,
  specialty,
  qualifications: [qualification],
  languages,
  availableDays
}));
