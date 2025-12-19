fetch("logs.json")
  .then(r => r.json())
  .then(logs => buildInsights(logs));

function buildInsights(logs) {
  let totalTime = 0;
  const tagTotals = {};
  const weekdayTotals = {};
  const monthTotals = {};

  logs.forEach(log => {
    const time = log.timeSpent || 0;
    totalTime += time;

    // ---- Tags ----
    if (log.tags) {
      log.tags.forEach(tag => {
        if (!tagTotals[tag.id]) {
          tagTotals[tag.id] = {
            name: tag.name,
            time: 0
          };
        }
        tagTotals[tag.id].time += tag.timeSpent || 0;
      });
    }

    // ---- Date-based ----
    if (log.created) {
      const d = new Date(log.created);

      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      weekdayTotals[weekday] = (weekdayTotals[weekday] || 0) + time;

      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthTotals[month] = (monthTotals[month] || 0) + time;
    }
  });

  renderSummary(logs.length, totalTime);
  renderTags(tagTotals, totalTime);
  renderList("weekday-list", weekdayTotals);
  renderList("month-list", monthTotals);
}

function secondsToHours(sec) {
  return (sec / 3600).toFixed(1);
}

function renderSummary(count, totalTime) {
  document.getElementById("total-time").textContent =
    `Total time logged: ${secondsToHours(totalTime)} hours`;

  document.getElementById("average-log").textContent =
    `Average work log: ${secondsToHours(totalTime / count)} hours`;
}

function renderTags(tags, totalTime) {
  const ul = document.getElementById("tag-list");

  Object.values(tags)
    .sort((a, b) => b.time - a.time)
    .forEach(tag => {
      const li = document.createElement("li");
      const pct = ((tag.time / totalTime) * 100).toFixed(1);

      li.innerHTML = `<strong>${tag.name}</strong> — ${secondsToHours(tag.time)} hrs (${pct}%)`;
      ul.appendChild(li);
    });
}

function renderList(id, data) {
  const ul = document.getElementById(id);

  Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, time]) => {
      const li = document.createElement("li");
      li.textContent = `${label}: ${secondsToHours(time)} hrs`;
      ul.appendChild(li);
    });
}
