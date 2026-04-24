"use client";

import { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export function FixCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUrgent: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target: Next 08:00 CAT (UTC+2)
      const target = new Date();
      target.setUTCHours(6, 0, 0, 0); // 08:00 CAT = 06:00 UTC

      // If we've passed today's 08:00, target tomorrow
      if (now.getTime() > target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        isUrgent: hours < 1,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={`rounded-xl p-5 ${
        timeLeft.isUrgent
          ? "bg-[#FCEBEB] border border-[#A32D2D]/20"
          : "bg-[#EAF3DE] border border-[#3B6D11]/20"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className={timeLeft.isUrgent ? "text-[#A32D2D]" : "text-[#3B6D11]"} />
          <span className="text-sm font-medium text-[var(--ink)]">
            Next Price Fix
          </span>
        </div>
        <Pill variant={timeLeft.isUrgent ? "red" : "green"} size="sm">
          {timeLeft.isUrgent ? "Urgent" : "On Track"}
        </Pill>
      </div>

      {/* Countdown Display */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-outfit text-[var(--ink)]">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-lg text-gray-400">h</span>
        </div>
        <span className="text-2xl text-gray-300">:</span>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-outfit text-[var(--ink)]">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-lg text-gray-400">m</span>
        </div>
        <span className="text-2xl text-gray-300">:</span>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-outfit text-[var(--ink)]">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-lg text-gray-400">s</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Zap size={12} />
        <span>Publishing at 08:00 CAT tomorrow</span>
      </div>
    </div>
  );
}
