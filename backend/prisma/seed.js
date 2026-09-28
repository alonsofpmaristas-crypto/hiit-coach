import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const exercises = [
  { slug: 'squat', name: 'Sentadillas', type: 'piernas', pointsPerRep: 1,
    description: 'Baja la cadera hasta que los muslos queden paralelos al suelo y sube.',
    keyJoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'] },
  { slug: 'pushup', name: 'Flexiones', type: 'pecho', pointsPerRep: 2,
    description: 'Baja el pecho flexionando los codos (~90°) y extiende los brazos.',
    keyJoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'] },
  { slug: 'jumping-jack', name: 'Jumping jacks', type: 'cardio', pointsPerRep: 1,
    description: 'Salta abriendo piernas y elevando los brazos por encima de la cabeza.',
    keyJoints: ['left_wrist', 'right_wrist', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'] },
  { slug: 'burpee', name: 'Burpees', type: 'cuerpo completo', pointsPerRep: 3,
    description: 'Agáchate, apoya manos, extiende piernas, vuelve y salta.',
    keyJoints: ['left_shoulder', 'left_hip', 'left_knee', 'left_wrist'] },
  { slug: 'situp', name: 'Abdominales', type: 'core', pointsPerRep: 1,
    description: 'Tumbado, eleva el torso hasta acercar el pecho a las rodillas.',
    keyJoints: ['left_shoulder', 'left_hip', 'left_knee', 'right_shoulder', 'right_hip', 'right_knee'] },
  { slug: 'lunge', name: 'Zancadas (lunges)', type: 'piernas', pointsPerRep: 1,
    description: 'Da un paso al frente y baja hasta que ambas rodillas formen ~90°.',
    keyJoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'] },
  { slug: 'mountain-climber', name: 'Mountain climbers', type: 'core', pointsPerRep: 1,
    description: 'En posición de plancha, lleva alternativamente las rodillas al pecho.',
    keyJoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee', 'left_shoulder'] },
  { slug: 'high-knees', name: 'Rodillas arriba', type: 'cardio', pointsPerRep: 1,
    description: 'Corre en el sitio elevando las rodillas por encima de la cadera.',
    keyJoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee'] },
];

for (const e of exercises) {
  await prisma.exercise.upsert({ where: { slug: e.slug }, update: e, create: e });
}
console.log(`Seed OK: ${exercises.length} ejercicios`);
await prisma.$disconnect();
