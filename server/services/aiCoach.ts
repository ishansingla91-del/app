export function generateFocusTip(context?: {
  active?: boolean;
  sessionsToday?: number;
}) {
  const baseTips = [
    "Start with the hardest task first.",
    "Close unnecessary tabs before your session starts.",
    "Keep your phone away from your desk.",
    "Use short breaks after deep work blocks.",
    "Work in one tab and one task at a time.",
  ];

  if (context?.active) {
    return "You are in focus mode. Avoid switching tabs and finish the current task before checking anything else.";
  }

  if ((context?.sessionsToday ?? 0) === 0) {
    return "Start with just one 25-minute session. Momentum matters more than intensity.";
  }

  return baseTips[Math.floor(Math.random() * baseTips.length)];
}
