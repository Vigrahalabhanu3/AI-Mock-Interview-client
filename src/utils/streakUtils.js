/**
 * Streak Calculation Utility
 * Calculates daily practice streak metrics based on interview timestamps.
 */

export function calculateStreak(interviews = []) {
  if (!interviews || interviews.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      practicedToday: false,
      weeklyActivity: [false, false, false, false, false, false, false],
    };
  }

  // Extract unique sorted practice dates (YYYY-MM-DD)
  const dateSet = new Set();
  interviews.forEach((item) => {
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split('T')[0];
        dateSet.add(dateStr);
      }
    }
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a)); // Descending

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const practicedToday = dateSet.has(todayStr);
  const practicedYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (practicedToday || practicedYesterday) {
    // Start counting streak backwards from today or yesterday
    let checkDate = practicedToday ? new Date(today) : new Date(yesterday);

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Longest Streak
  let longestStreak = currentStreak;
  let tempStreak = 0;
  
  if (sortedDates.length > 0) {
    let prevDate = null;
    // Iterate chronological dates
    const chronDates = [...sortedDates].reverse();
    
    chronDates.forEach((dateStr) => {
      const curr = new Date(dateStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = curr;
    });
  }

  // Calculate Current Week Activity (Mon - Sun)
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weeklyActivity = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dayStr = day.toISOString().split('T')[0];
    weeklyActivity.push(dateSet.has(dayStr));
  }

  return {
    currentStreak,
    longestStreak,
    practicedToday,
    weeklyActivity,
  };
}
