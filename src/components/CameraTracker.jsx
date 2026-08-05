import { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

const PROCESS_WIDTH = 480;
const PROCESS_HEIGHT = 360;
const METRIC_INTERVAL = 100;
const FRAME_INTERVAL = 50;

const CameraTracker = ({ onMetricsUpdate }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(0);
  const lastMetricRef = useRef(0);
  const prevPositionsRef = useRef({ index: null, middle: null, wrist: null });
  const emaSpeedRef = useRef(1.15);
  const jitterBufferRef = useRef([]);
  const rhythmBufferRef = useRef([]);
  const onMetricsRef = useRef(onMetricsUpdate);

  useEffect(() => {
    onMetricsRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  const computeMetrics = useCallback((indexTip, middleTip, wrist, dt) => {
    const prev = prevPositionsRef.current;
    let finalSpeed = emaSpeedRef.current;

    if (prev.index && prev.middle && dt > 0) {
      const indexDist = Math.hypot(indexTip.x - prev.index.x, indexTip.y - prev.index.y);
      const middleDist = Math.hypot(middleTip.x - prev.middle.x, middleTip.y - prev.middle.y);
      const avgDist = (indexDist + middleDist) / 2;
      const velocity = (avgDist / dt) * 1000;

      let targetSpeed = 0.35;
      if (velocity > 0.03) {
        targetSpeed = Math.min(1.35, 0.35 + velocity * 2.2);
      }

      const alpha = 0.35;
      emaSpeedRef.current = alpha * targetSpeed + (1 - alpha) * emaSpeedRef.current;
      finalSpeed = parseFloat(emaSpeedRef.current.toFixed(2));

      jitterBufferRef.current.push(avgDist);
      if (jitterBufferRef.current.length > 20) jitterBufferRef.current.shift();
      const jitter = jitterBufferRef.current.length > 3
        ? jitterBufferRef.current.reduce((s, v, _, a) => s + Math.abs(v - a.reduce((x, y) => x + y, 0) / a.length), 0) / jitterBufferRef.current.length
        : 0;

      rhythmBufferRef.current.push(velocity);
      if (rhythmBufferRef.current.length > 15) rhythmBufferRef.current.shift();
      const rhythmVar = rhythmBufferRef.current.length > 3
        ? Math.sqrt(rhythmBufferRef.current.reduce((s, v) => s + (v - rhythmBufferRef.current.reduce((a, b) => a + b, 0) / rhythmBufferRef.current.length) ** 2, 0) / rhythmBufferRef.current.length)
        : 0;
    }

    const activityLevel = Math.round(Math.min(95, Math.max(15, (finalSpeed / 1.3) * 85)));
    const sittingMinutes = Math.round(Math.min(120, Math.max(30, 130 - (finalSpeed / 1.3) * 75)));

    let balanceScore = 78;
    if (prev.wrist && wrist) {
      const wristStability = Math.hypot(wrist.x - prev.wrist.x, wrist.y - prev.wrist.y);
      balanceScore = Math.round(Math.min(95, Math.max(40, 90 - wristStability * 800)));
    }

    const jitterAvg = jitterBufferRef.current.length > 3
      ? jitterBufferRef.current.reduce((s, v, _, a) => s + Math.abs(v - a.reduce((x, y) => x + y, 0) / a.length), 0) / jitterBufferRef.current.length
      : 0;
    const tremorIndex = parseFloat(Math.min(40, Math.max(5, 8 + jitterAvg * 120)).toFixed(1));

    const rhythmVar = rhythmBufferRef.current.length > 3
      ? Math.sqrt(rhythmBufferRef.current.reduce((s, v) => {
          const mean = rhythmBufferRef.current.reduce((a, b) => a + b, 0) / rhythmBufferRef.current.length;
          return s + (v - mean) ** 2;
        }, 0) / rhythmBufferRef.current.length)
      : 0;
    const gaitRhythm = Math.round(Math.min(95, Math.max(45, 88 - rhythmVar * 15)));

    const heartRateVar = Math.round(Math.min(65, Math.max(25, 30 + finalSpeed * 25 - tremorIndex * 0.5)));

    return {
      walkingSpeed: finalSpeed,
      activityLevel,
      sittingMinutes,
      balanceScore,
      tremorIndex,
      gaitRhythm,
      heartRateVar,
      isHighRisk: finalSpeed < 0.85 || activityLevel < 50 || balanceScore < 55,
    };
  }, []);

  useEffect(() => {
    if (!window.Hands || !window.Camera) return;

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      canvas.width = PROCESS_WIDTH;
      canvas.height = PROCESS_HEIGHT;

      ctx.save();
      ctx.clearRect(0, 0, PROCESS_WIDTH, PROCESS_HEIGHT);
      ctx.translate(PROCESS_WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, PROCESS_WIDTH, PROCESS_HEIGHT);

      const now = performance.now();

      if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        if (window.drawConnectors) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#10b981', lineWidth: 2 });
        }
        if (window.drawLandmarks) {
          window.drawLandmarks(ctx, landmarks, { color: '#f43f5e', lineWidth: 1, radius: 2 });
        }

        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const wrist = landmarks[0];

        if (now - lastMetricRef.current > METRIC_INTERVAL) {
          const dt = now - lastMetricRef.current;
          const metrics = computeMetrics(indexTip, middleTip, wrist, dt);
          onMetricsRef.current?.(metrics);

          prevPositionsRef.current = {
            index: { x: indexTip.x, y: indexTip.y },
            middle: { x: middleTip.x, y: middleTip.y },
            wrist: { x: wrist.x, y: wrist.y },
          };
          lastMetricRef.current = now;
        }
      } else if (now - lastMetricRef.current > 200) {
        emaSpeedRef.current = Math.max(0.35, emaSpeedRef.current * 0.92);
        const metrics = computeMetrics(null, null, null, 200);
        onMetricsRef.current?.(metrics);
        lastMetricRef.current = now;
      }

      ctx.restore();
    });

    let camera = null;
    let mounted = true;

    const startCamera = () => {
      const video = webcamRef.current?.video;
      if (!video || !mounted) return;

      camera = new window.Camera(video, {
        onFrame: async () => {
          if (!mounted) return;
          const now = performance.now();
          if (now - lastFrameRef.current < FRAME_INTERVAL) return;
          lastFrameRef.current = now;
          try {
            await hands.send({ image: video });
          } catch {
            /* frame drop */
          }
        },
        width: PROCESS_WIDTH,
        height: PROCESS_HEIGHT,
      });
      camera.start();
    };

    const timer = setTimeout(startCamera, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (camera) camera.stop();
      hands.close();
    };
  }, [computeMetrics]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: PROCESS_WIDTH, height: PROCESS_HEIGHT, facingMode: 'user' }}
        className="hidden"
      />
      <canvas ref={canvasRef} className="aspect-video w-full bg-slate-950 object-cover" />
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-emerald-500/50 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-emerald-400 backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Live AI Tracking
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 backdrop-blur-md">
        <p className="mb-0.5 font-semibold text-emerald-400">Interactive Gait Simulation</p>
        <p className="text-[11px] text-slate-400">Move fingers to simulate walking speed, balance, tremor &amp; rhythm</p>
      </div>
    </div>
  );
};

export default CameraTracker;
