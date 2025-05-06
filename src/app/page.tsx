"use client";

import React, { useState, useEffect } from 'react';
import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays, differenceInHours, differenceInSeconds } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const calculateDifference = (
  a: string | Date,
  b: string | Date,
  format: string
): string => {
  if (!a || !b) return '';
  const [start, end] = [new Date(a), new Date(b)].sort((a, b) => a.getTime() - b.getTime());

  const years = differenceInYears(end, start);
  start.setFullYear(start.getFullYear() + years);
  const months = differenceInMonths(end, start);
  start.setMonth(start.getMonth() + months);
  const weeks = differenceInWeeks(end, start);
  start.setDate(start.getDate() + weeks * 7);
  const days = differenceInDays(end, start);
  start.setDate(start.getDate() + days);
  const hours = differenceInHours(end, start);
  start.setHours(start.getHours() + hours);
  const seconds = differenceInSeconds(end, start);

  const parts = [];
  if (years) parts.push(`${years} yr`);
  if (months) parts.push(`${months} mo`);
  if (weeks) parts.push(`${weeks} wk`);
  if (days) parts.push(`${days} d`);
  if (hours) parts.push(`${hours} hr`);
  if (seconds) parts.push(`${seconds} sec`);

  if (format !== 'default') {
    const divisor = eval(format); // Not best practice, but works for controlled values
    return `${Math.floor((end.getTime() - start.getTime()) / divisor)} units`;
  }

  return parts.join(', ');
};

export default function DateCalculator() {
  const [dateA, setDateA] = useState('');
  const [dateB, setDateB] = useState('');
  const [sinceDate, setSinceDate] = useState('');
  const [format, setFormat] = useState('default');

  const [difference, setDifference] = useState('');
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    if (dateA && dateB) {
      setDifference(calculateDifference(dateA, dateB, format));
    }
  }, [dateA, dateB, format]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sinceDate) {
        setTimeSince(calculateDifference(sinceDate, new Date(), format));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sinceDate, format]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">🕰️ Date Calculator</h1>
      <Tabs defaultValue="between">
        <TabsList className="mb-4">
          <TabsTrigger value="between">Time Between Dates</TabsTrigger>
          <TabsTrigger value="since">Time Since</TabsTrigger>
        </TabsList>

        <TabsContent value="between">
          <Card className="mb-4">
            <CardContent className="p-4 space-y-2">
              <div>
                <label>Date A:</label>
                <Input type="datetime-local" value={dateA} onChange={e => setDateA(e.target.value)} />
              </div>
              <div>
                <label>Date B:</label>
                <Input type="datetime-local" value={dateB} onChange={e => setDateB(e.target.value)} />
              </div>
              <div>
                <label>Format:</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Y/M/W/D/H/S)</SelectItem>
                    <SelectItem value="1000">Milliseconds</SelectItem>
                    <SelectItem value="1000*60">Minutes</SelectItem>
                    <SelectItem value="1000*60*60">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 text-xl">{difference}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="since">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div>
                <label>Past Date:</label>
                <Input type="datetime-local" value={sinceDate} onChange={e => setSinceDate(e.target.value)} />
              </div>
              <div>
                <label>Format:</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Y/M/W/D/H/S)</SelectItem>
                    <SelectItem value="1000">Milliseconds</SelectItem>
                    <SelectItem value="1000*60">Minutes</SelectItem>
                    <SelectItem value="1000*60*60">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 text-xl">{timeSince}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ad Placeholder */}
      <div className="mt-8 border p-4 text-center bg-gray-100 rounded">
        <p>🔗 Your Ad Here — Monetize with Google AdSense or Affiliate Banners</p>
      </div>
    </main>
  );
}
