import { useState, useEffect, useCallback } from "react";
import { getAvailableDates, getEventDataByDate } from "../utils/api";
import ResultImageMapper from "../components/ResultImageMapper";
import EventPermutationTool from "../components/EventPermutationTool";
import ManualEditTool from "../components/ManualEditTool";
import dayjs from "dayjs";

export default function CalendarView() {
  const now = dayjs();
  const [availableDates, setAvailableDates] = useState({});
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.format("MMMM"));
  const [day, setDay] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ✅ Load available dates from backend
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getAvailableDates();
        const data = res.data?.data || {};
        setAvailableDates(data);

        // auto-select the first available day if any
        const years = Object.keys(data);
        if (years.length > 0) {
          const firstYear = years[0];
          const monthsArr = Object.keys(data[firstYear]);
          if (monthsArr.length > 0) {
            const firstMonth = monthsArr[0];
            const daysArr = Object.keys(data[firstYear][firstMonth]);
            if (daysArr.length > 0) {
              const firstDay = Number(daysArr[0]);
              setYear(Number(firstYear));
              setMonth(firstMonth);
              setDay(firstDay);
              await handleDateClick(firstDay, firstYear, firstMonth);
            }
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch available dates:", err);
      }
    };
    init();
  }, []);

  // ✅ Fetch events for selected date
  const handleDateClick = useCallback(
    async (selectedDay, customYear, customMonth) => {
      const y = Number(customYear || year);
      const m = customMonth || month;
      setDay(selectedDay);
      setYear(y);
      setMonth(m);
      setLoading(true);

      try {
        const res = await getEventDataByDate(y, m, selectedDay);
        const grouped = res.data?.data || {};
        const list = Object.entries(grouped).flatMap(([eventName, rows]) =>
          (rows || []).map((r) => ({ ...r, eventName }))
        );
        setEventData(list);
      } catch (err) {
        console.error("❌ Error fetching event data:", err);
        setEventData([]);
      } finally {
        setLoading(false);
      }
    },
    [year, month]
  );

  // ✅ Helpers
  const getDaysInMonth = (y, m) => dayjs(`${y}-${dayjs().month(m).month() + 1}-01`).daysInMonth();
  const hasData = (y, m, d) => !!availableDates?.[y]?.[m]?.[d];

  const allYears = Object.keys(availableDates)
    .map(Number)
    .sort((a, b) => b - a);

  // ✅ Auto-update available month/day when year changes
  useEffect(() => {
    if (availableDates[year] && !availableDates[year][month]) {
      const firstAvailableMonth = Object.keys(availableDates[year])[0];
      setMonth(firstAvailableMonth);
      setDay(null);
    }
  }, [year, availableDates]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center">📅 Calendar View</h3>

      {/* Year / Month / Date dropdowns */}
      <div className="flex flex-wrap justify-center gap-3">
        {/* Year */}
        <select
          className="border p-2 rounded"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {allYears.length > 0
            ? allYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))
            : <option>{year}</option>}
        </select>

        {/* Month */}
        <select
          className="border p-2 rounded"
          value={month}
          onChange={(e) => {
            const newMonth = e.target.value;
            setMonth(newMonth);
            setDay(null);
          }}
        >
          {months.map((m) => (
            <option
              key={m}
              value={m}
              disabled={!availableDates?.[year]?.[m]}
            >
              {m}
            </option>
          ))}
        </select>

        {/* Day */}
        <select
          className="border p-2 rounded"
          value={day || ""}
          onChange={(e) => handleDateClick(Number(e.target.value))}
        >
          <option value="">Select Date</option>
          {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)
            .filter((d) => hasData(year, month, d))
            .map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
        </select>
      </div>

      {/* Full Month Grid */}
      <div className="grid grid-cols-7 gap-2 border-t border-l mt-4">
        {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map((d) => {
          const active = hasData(year, month, d);
          const isSelected = d === day;
          return (
            <button
              key={d}
              onClick={() => active && handleDateClick(d)}
              className={`h-16 border-r border-b flex flex-col items-center justify-center transition ${
                active
                  ? isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span className="font-medium">{d}</span>
              {active && <span className="text-xs">●</span>}
            </button>
          );
        })}
      </div>

      {/* Event Section */}
      <div className="border rounded p-4 bg-white shadow">
        {loading ? (
          <p>Loading events...</p>
        ) : day && eventData.length > 0 ? (
          <>
            <h4 className="text-lg font-bold mb-3">
              Events for {day} {month} {year}
            </h4>
            <ul className="space-y-4">
              {eventData.map((ev, idx) => (
                <li key={idx} className="border-b pb-2 hover:bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-blue-700">{ev.eventName}</p>
                    {ev.representative && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        📊 Representative Set
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    ⏰ {ev.fromTime || "?"} → {ev.toTime || "?"}
                  </p>

                  <div className="mt-1">
                    {ev.results && (
                      <ul className="text-sm text-gray-700 list-disc ml-5">
                      {Object.entries(ev.results).map(([key, val]) => (
  <li key={key}>
    {key}: {typeof val === "object" ? JSON.stringify(val) : val}
  </li>
))}
                      </ul>
                    )}
                  </div>

                  {ev.imageUrl && (
                    <img
                      src={`http://localhost:5000/${ev.imageUrl}`}
                      alt={ev.eventName}
                      className="mt-2 w-40 h-40 object-cover rounded"
                    />
                  )}

                  <div className="mt-4 border-t pt-3">
                    <EventPermutationTool
                      eventName={ev.eventName}
                      date={ev.date}
                      baseResults={ev.results}
                    />
                  </div>

                  <div className="mt-3">
                    <ManualEditTool eventId={ev.id} currentData={ev.results} />
                  </div>

                  <div className="mt-3">
                    <ResultImageMapper eventId={ev.id} baseResults={ev.results} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : day ? (
          <p>No events for this date.</p>
        ) : (
          <p>Select a date to view events.</p>
        )}
      </div>
    </div>
  );
}
