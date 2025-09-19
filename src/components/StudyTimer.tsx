import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StudyTimerProps {
  onTimerComplete?: () => void;
  className?: string;
}

const TIMER_PRESETS = {
  pomodoro: { work: 25, break: 5, longBreak: 15 },
  custom: { work: 30, break: 10, longBreak: 20 },
  extended: { work: 50, break: 10, longBreak: 30 }
};

type TimerPhase = 'work' | 'break' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function StudyTimer({ onTimerComplete, className }: StudyTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('work');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_PRESETS.pomodoro.work * 60);
  const [totalTime, setTotalTime] = useState(TIMER_PRESETS.pomodoro.work * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [settings, setSettings] = useState(TIMER_PRESETS.pomodoro);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState, timeRemaining]);

  const handleTimerComplete = () => {
    setTimerState('completed');
    
    // Play notification sound (would be implemented with audio API)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        currentPhase === 'work' ? 'Study session complete!' : 'Break time over!',
        {
          body: getNextPhaseMessage(),
          icon: '/favicon.ico'
        }
      );
    }

    // Auto-transition to next phase after 5 seconds
    setTimeout(() => {
      if (currentPhase === 'work') {
        setSessionCount(prev => prev + 1);
        const nextPhase = (sessionCount + 1) % 4 === 0 ? 'longBreak' : 'break';
        startPhase(nextPhase);
      } else {
        startPhase('work');
      }
    }, 5000);

    onTimerComplete?.();
  };

  const startPhase = (phase: TimerPhase) => {
    setCurrentPhase(phase);
    const duration = settings[phase] * 60;
    setTimeRemaining(duration);
    setTotalTime(duration);
    setTimerState('idle');
  };

  const startTimer = () => {
    if (timerState === 'idle' || timerState === 'paused') {
      setTimerState('running');
    }
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeRemaining(totalTime);
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getPhaseIcon = (phase: TimerPhase) => {
    switch (phase) {
      case 'work':
        return <BookOpen className="h-4 w-4" />;
      case 'break':
      case 'longBreak':
        return <Coffee className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: TimerPhase) => {
    switch (phase) {
      case 'work':
        return 'text-blue-600';
      case 'break':
        return 'text-green-600';
      case 'longBreak':
        return 'text-purple-600';
    }
  };

  const getPhaseLabel = (phase: TimerPhase) => {
    switch (phase) {
      case 'work':
        return 'Study Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const getNextPhaseMessage = () => {
    if (currentPhase === 'work') {
      const nextPhase = (sessionCount + 1) % 4 === 0 ? 'Long Break' : 'Short Break';
      return `Time for a ${nextPhase.toLowerCase()}!`;
    }
    return 'Ready for your next study session?';
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Phase Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={getPhaseColor(currentPhase)}>
              {getPhaseIcon(currentPhase)}
            </div>
            <Badge variant="outline" className={getPhaseColor(currentPhase)}>
              {getPhaseLabel(currentPhase)}
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="space-y-2">
            <div className="text-6xl font-mono font-bold text-foreground">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Session Counter */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Sessions completed:</span>
            <Badge variant="secondary">{sessionCount}</Badge>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {timerState === 'idle' || timerState === 'paused' ? (
              <Button onClick={startTimer} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                {timerState === 'paused' ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            <Button onClick={resetTimer} variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Timer Preset</Label>
                    <Select
                      value={Object.keys(TIMER_PRESETS).find(key => 
                        TIMER_PRESETS[key as keyof typeof TIMER_PRESETS].work === settings.work
                      ) || 'custom'}
                      onValueChange={(value) => {
                        if (value in TIMER_PRESETS) {
                          const newSettings = TIMER_PRESETS[value as keyof typeof TIMER_PRESETS];
                          setSettings(newSettings);
                          if (timerState === 'idle') {
                            const duration = newSettings[currentPhase] * 60;
                            setTimeRemaining(duration);
                            setTotalTime(duration);
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pomodoro">Pomodoro (25/5/15)</SelectItem>
                        <SelectItem value="custom">Custom (30/10/20)</SelectItem>
                        <SelectItem value="extended">Extended (50/10/30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Work (min)</Label>
                      <div className="text-center p-2 bg-muted rounded">
                        {settings.work}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Break (min)</Label>
                      <div className="text-center p-2 bg-muted rounded">
                        {settings.break}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Long Break (min)</Label>
                      <div className="text-center p-2 bg-muted rounded">
                        {settings.longBreak}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={requestNotificationPermission}
                    >
                      Enable Notifications
                    </Button>
                    <Button 
                      onClick={() => setIsSettingsOpen(false)}
                      className="flex-1"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Actions */}
          {timerState === 'running' && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={skipPhase}>
                Skip {getPhaseLabel(currentPhase)}
              </Button>
            </div>
          )}

          {/* Completion Message */}
          {timerState === 'completed' && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                {currentPhase === 'work' ? '🎉 Great work!' : '☕ Break time over!'}
              </p>
              <p className="text-xs text-muted-foreground">
                {getNextPhaseMessage()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}