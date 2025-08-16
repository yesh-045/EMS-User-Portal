import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRegisteredEvents,
  getOngoingEvents,
  getUpcomingEvents,
  getPastEvents,
} from "../api";
import type { RegisteredEvent, EventListItem } from "../types/user";
import Button from "../components/Button";
import {
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineEnvironment,
} from "react-icons/ai";

type TimelineMode = "registered" | "all";

// Constants for layout
const DAY_WIDTH = 100;       // px per day
const MONTH_ROW_H = 24;      // px
const DAY_ROW_H = 40;        // px
const EVENTS_TOP = MONTH_ROW_H + DAY_ROW_H + 16; // px

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>(
    []
  );
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<TimelineMode>("registered");
  const timelineRef = useRef<HTMLDivElement>(null);

  // For drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const preventClickRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [regRes, past, ongoing, upcoming] = await Promise.all([
          getRegisteredEvents(),
          getPastEvents().catch(() => ({ data: [] })),
          getOngoingEvents(),
          getUpcomingEvents(),
        ]);

        setRegisteredEvents(regRes.data);
        setAllEvents([...past.data, ...ongoing.data, ...upcoming.data]);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Generate days for the timeline (6 months before and after today)
  const generateDays = () => {
    const today = new Date();
    const days = [];

    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);
    endDate.setHours(23, 59, 59, 999);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const days = generateDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month segments for header
  const monthSegments = useMemo(() => {
    type Segment = { key: string; label: string; startIndex: number; length: number };
    if (!days.length) return [] as Segment[];

    const segs: Segment[] = [];
    let currentMonth = days[0].getMonth();
    let currentYear = days[0].getFullYear();
    let startIndex = 0;

    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
        const label = new Date(currentYear, currentMonth, 1).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        segs.push({
          key: `${currentYear}-${currentMonth}`,
          label,
          startIndex,
          length: i - startIndex,
        });
        startIndex = i;
        currentMonth = d.getMonth();
        currentYear = d.getFullYear();
      }
    }
    // push last
    const lastLabel = new Date(currentYear, currentMonth, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    segs.push({
      key: `${currentYear}-${currentMonth}`,
      label: lastLabel,
      startIndex,
      length: days.length - startIndex,
    });

    return segs;
  }, [days]);

  // Prepare events
  const timelineEvents =
    mode === "registered"
      ? registeredEvents.map((reg) => ({
          id: reg.event.id,
          name: reg.event.name,
          date: reg.event.date,
          endDate: reg.event.endDate || reg.event.date,
          venue: reg.event.venue,
          description: reg.event.about,
          teamName: reg.team_name,
          isRegistered: true,
          event_type: reg.event.event_type,
          event_category: reg.event.event_category,
          color: "#8b5cf6",
          status: "registered",
        }))
      : allEvents.map((event) => {
          const isReg = registeredEvents.some(
            (reg) => reg.event.id === event.id
          );
          let color = "#6b7280";
          if (isReg) color = "#8b5cf6";
          else if (event.status === "ongoing") color = "#10b981";
          else if (event.status === "upcoming") color = "#3b82f6";

          return {
            id: event.id,
            name: event.name,
            date: event.date,
            endDate: event.endDate || event.date,
            venue: event.venue,
            description: event.about,
            isRegistered: isReg,
            teamName:
              registeredEvents.find((reg) => reg.event.id === event.id)
                ?.team_name || null,
            event_type: event.event_type,
            event_category: event.event_category,
            color,
            status: event.status,
          };
        });

  // Position events
  const positionEvents = () => {
    const startDay = days[0];
    const eventsWithDates = timelineEvents.filter((event) => event.date);

    const positionedEvents = eventsWithDates.map((event) => {
      const startDateObj = new Date(event.date as string);
      const endDateObj = new Date(event.endDate as string);

      const validStartDate = !isNaN(startDateObj.getTime())
        ? startDateObj
        : new Date();
      const validEndDate = !isNaN(endDateObj.getTime())
        ? endDateObj
        : new Date(validStartDate.getTime() + 86400000);

      const startDiff = Math.max(
        0,
        Math.floor((validStartDate.getTime() - startDay.getTime()) / 86400000)
      );
      const endDiff = Math.floor((validEndDate.getTime() - startDay.getTime()) / 86400000);

      const duration = Math.max(1, endDiff - startDiff);

      return {
        ...event,
        left: startDiff * DAY_WIDTH,
        width: duration * DAY_WIDTH,
        startDate: validStartDate,
        endDate: validEndDate,
      };
    });

    const rows: { [key: number]: number } = {};
    return positionedEvents.map((event) => {
      let rowIndex = 0;
      while (rows[rowIndex] && rows[rowIndex] > event.left) {
        rowIndex++;
      }
      rows[rowIndex] = event.left + event.width;

      return {
        ...event,
        row: rowIndex,
      };
    });
  };

  const positionedEvents = positionEvents();

  // Scroll to today after load
  useEffect(() => {
    if (!loading && timelineRef.current) {
      const todayMarker = timelineRef.current.querySelector(".today-marker");
      if (todayMarker) {
        (todayMarker as HTMLElement).scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });
      }
    }
  }, [loading]);

  // Support vertical wheel to horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      timelineRef.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const handleScroll = (amount: number) => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Document-level mouse drag
  const onMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current || !timelineRef.current) return;
    const walk = (e.clientX - dragStartXRef.current) * 1.5;
    if (Math.abs(walk) > 5) preventClickRef.current = true;
    timelineRef.current.scrollLeft = dragStartScrollLeftRef.current - walk;
  };
  const onMouseUp = () => {
    draggingRef.current = false;
    setIsDragging(false);
    if (timelineRef.current) timelineRef.current.style.cursor = "grab";
    window.removeEventListener("mousemove", onMouseMove as any);
    window.removeEventListener("mouseup", onMouseUp);
    setTimeout(() => (preventClickRef.current = false), 0);
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    draggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = timelineRef.current.scrollLeft;
    timelineRef.current.style.cursor = "grabbing";
    preventClickRef.current = false;
    window.addEventListener("mousemove", onMouseMove as any);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    draggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.touches[0].clientX;
    dragStartScrollLeftRef.current = timelineRef.current.scrollLeft;
    timelineRef.current.style.cursor = "grabbing";
    preventClickRef.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !timelineRef.current) return;
    const clientX = e.touches[0].clientX;
    const walk = (clientX - dragStartXRef.current) * 1.5;
    if (Math.abs(walk) > 5) preventClickRef.current = true;
    timelineRef.current.scrollLeft = dragStartScrollLeftRef.current - walk;
    e.preventDefault();
  };
  const handleTouchEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);
    if (timelineRef.current) timelineRef.current.style.cursor = "grab";
    setTimeout(() => (preventClickRef.current = false), 0);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">Event Timeline</h1>
            <p className="text-text-secondary mt-1">
              View all events on a horizontal timeline
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Controls */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AiOutlineCalendar className="w-6 h-6 text-purple-500" />
              <h3 className="font-medium text-text">
                {mode === "registered" ? "My Events" : "All Events"}
              </h3>
            </div>
            <div className="bg-background border border-border rounded-full p-1 flex items-center">
              <button
                onClick={() => setMode("registered")}
                className={`px-4 py-2 rounded-full text-sm ${
                  mode === "registered"
                    ? "bg-accent text-primary"
                    : "text-text-secondary hover:bg-button-hover"
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => setMode("all")}
                className={`px-4 py-2 rounded-full text-sm ${
                  mode === "all"
                    ? "bg-accent text-primary"
                    : "text-text-secondary hover:bg-button-hover"
                }`}
              >
                All Events
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="bg-surface rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading timeline...</p>
          </div>
        ) : (
          <div className="relative bg-surface rounded-xl border border-border shadow-lg p-6 overflow-hidden">
            <div
              ref={timelineRef}
              className="relative overflow-x-auto"
              style={{
                height: "460px",
                whiteSpace: "nowrap",
                cursor: "grab",
                userSelect: isDragging ? "none" as const : "auto",
                touchAction: "pan-y",             // allow vertical page scroll, disable native horizontal gestures
                WebkitOverflowScrolling: "touch", // momentum on iOS
                overflowY: "hidden",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              onDragStart={(e) => e.preventDefault()}
            >
              <div
                className="relative inline-block"
                style={{ width: `${days.length * DAY_WIDTH}px`, height: "100%" }}
              >
                {/* Month row */}
                <div
                  className="absolute left-0 flex items-stretch border-b border-border text-text-secondary text-xs"
                  style={{ top: 0, height: `${MONTH_ROW_H}px` }}
                >
                  {monthSegments.map((seg) => (
                    <div
                      key={seg.key}
                      className="flex items-center justify-center"
                      style={{
                        width: `${seg.length * DAY_WIDTH}px`,
                        flexShrink: 0,
                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      <span className="px-2">{seg.label}</span>
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div
                  className="absolute left-0 flex border-b border-border"
                  style={{ top: `${MONTH_ROW_H}px`, height: `${DAY_ROW_H}px` }}
                >
                  {days.map((day) => {
                    const isToday = day.toDateString() === today.toDateString();
                    const isFirstOfMonth = day.getDate() === 1;
                    return (
                      <div
                        key={day.toISOString()}
                        className={`relative text-xs text-center flex flex-col items-center justify-center ${
                          isToday ? "text-accent font-bold today-marker" : "text-text-secondary"
                        }`}
                        style={{
                          width: `${DAY_WIDTH}px`,
                          flexShrink: 0,
                          borderRight: "1px solid var(--border)",
                        }}
                      >
                        {day.getDate()}
                        <span className="text-[10px]">
                          {isFirstOfMonth
                            ? day.toLocaleDateString("default", { month: "short", year: "numeric" })
                            : day.toLocaleDateString("default", { weekday: "short" })}
                        </span>
                        {isToday && (
                          <div
                            className="absolute left-1/2 transform -translate-x-1/2 bg-accent opacity-50"
                            style={{ top: "100%", width: "4px", height: "320px" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Events */}
                <div
                  className="absolute left-0"
                  style={{ top: `${EVENTS_TOP}px`, height: "320px" }}
                >
                  {positionedEvents.map((event) => (
                    <div
                      key={`event-${event.id}`}
                      className="absolute rounded-md p-2 border cursor-pointer hover:opacity-90"
                      style={{
                        left: `${event.left}px`,
                        width: `${event.width}px`,
                        top: `${event.row * 45}px`,
                        height: "40px",
                        backgroundColor: `${event.color}20`,
                        borderColor: event.color,
                        borderLeft: `4px solid ${event.color}`,
                        zIndex: event.isRegistered ? 10 : 5,
                      }}
                      onClick={() => {
                        if (preventClickRef.current) return;
                        navigate(`/events/${event.id}`);
                      }}
                    >
                      <div className="text-xs font-medium truncate text-text">{event.name}</div>
                      <div className="text-[10px] truncate text-text-secondary flex items-center">
                        <AiOutlineEnvironment className="w-2 h-2 mr-0.5" />
                        {event.venue} • {event.event_type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll buttons */}
            <button
              onClick={() => handleScroll(-500)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/90 rounded-full p-2 shadow-md border border-border z-20"
            >
              ◀
            </button>
            <button
              onClick={() => handleScroll(500)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/90 rounded-full p-2 shadow-md border border-border z-20"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
