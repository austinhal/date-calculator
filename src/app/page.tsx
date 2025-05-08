"use client";

import React, { useState, useEffect } from 'react';
import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays, differenceInHours, differenceInSeconds } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import Script from 'next/script';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

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
    const divisor = eval(format);
    return `${Math.floor((end.getTime() - start.getTime()) / divisor)} units`;
  }

  return parts.join(', ');
};

const timezones = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'
];

export default function DateCalculator() {
  const [dateA, setDateA] = useState('');
  const [dateB, setDateB] = useState('');
  const [sinceDate, setSinceDate] = useState('');
  const [format, setFormat] = useState('default');
  const [difference, setDifference] = useState('');
  const [timeSince, setTimeSince] = useState('');

  const [meetingTime, setMeetingTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const [participants, setParticipants] = useState([
    { name: 'You', timezone: timezone, workStart: '09:00', workEnd: '17:00' }
  ]);

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
          <TabsTrigger value="scheduler">Timezone Scheduler</TabsTrigger>
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

        <TabsContent value="scheduler">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-2xl font-semibold">🕓 Timezone Scheduler</h2>
              <p className="text-muted-foreground">Choose a meeting time in your timezone and see how it maps to others.</p>
              <div>
                <label>Your Meeting Time:</label>
                <Input type="datetime-local" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
              </div>
              <div>
                <label>Your Timezone:</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="font-medium mb-2">Participants:</h3>
                {participants.map((p, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-4 border-b pb-2">
                    <Input
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) => {
                        const newP = [...participants];
                        newP[i].name = e.target.value;
                        setParticipants(newP);
                      }}
                    />
                    <Select value={p.timezone} onValueChange={(val) => {
                      const newP = [...participants];
                      newP[i].timezone = val;
                      setParticipants(newP);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Timezone" /></SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <div>
                        <label className="block text-sm font-medium">Start</label>
                        <Input
                          type="time"
                          value={p.workStart}
                          onChange={(e) => {
                            const newP = [...participants];
                            newP[i].workStart = e.target.value;
                            setParticipants(newP);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">End</label>
                        <Input
                          type="time"
                          value={p.workEnd}
                          onChange={(e) => {
                            const newP = [...participants];
                            newP[i].workEnd = e.target.value;
                            setParticipants(newP);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-gray-100 rounded px-3 py-1 text-sm hover:bg-gray-200"
                  onClick={() => setParticipants([...participants, { name: '', timezone: 'UTC', workStart: '09:00', workEnd: '17:00' }])}
                >
                  + Add Participant
                </button>
                {meetingTime && !isNaN(new Date(meetingTime).getTime()) && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Meeting Time Results:</h4>
                    <table className="w-full border text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Participant</th>
                          <th className="p-2 text-left">Local Time</th>
                          <th className="p-2 text-left">Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, i) => {
                          const localTimeStr = formatInTimeZone(
                            toZonedTime(new Date(meetingTime), timezone),
                            p.timezone,
                            'yyyy-MM-dd HH:mm'
                          );
                          const timeOnly = localTimeStr.split(' ')[1];
                          const isGood = timeOnly >= p.workStart && timeOnly <= p.workEnd;
                          const displayTime = formatInTimeZone(
                            toZonedTime(new Date(meetingTime), timezone),
                            p.timezone,
                            'yyyy-MM-dd HH:mm zzz'
                          );
                          return (
                            <tr key={i} className="border-t">
                              <td className="p-2">{p.name || '(Unnamed)'}</td>
                              <td className="p-2">{displayTime}</td>
                              <td className="p-2">{isGood ? '✅ Available' : '❌ Unavailable'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AdSense Banner */}
      <div className="mt-8 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="2222222222"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <Script id="adsense-footer" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    </main>
  );
}
