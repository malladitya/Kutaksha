# Kutaksha

Kutaksha is a preventive healthcare demo platform for monitoring eldercare wellness patterns through a browser-based dashboard. The application models patient movement and behavior trends to estimate health stability, risk, and severity using a lightweight digital-twin-inspired scoring flow.

## What this project does

- Provides role-based dashboards for:
  - Patient
  - Caretaker
  - Doctor
- Captures live webcam-based hand movement signals for a demo tracking experience
- Converts movement signals into health-related metrics
- Displays trend charts for:
  - HSI (Health Stability Index)
  - Risk score
  - Severity score
- Generates downloadable report text and CSV summaries
- Uses browser local storage for demo authentication and persisted sample metrics

## Project architecture

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts
- react-webcam

### Tracking and scoring logic
- Camera input via `react-webcam`
- Real-time hand landmark extraction via MediaPipe Hands
- Feature extraction from landmark movement such as hand velocity, stability, rhythm, and variability
- Local scoring heuristics implemented in `src/utils/metrics.js`

## AI and API usage

### AI / vision stack currently used
1. MediaPipe Hands
   - Purpose: live hand landmark detection from webcam video
   - Used in: `src/components/CameraTracker.jsx`
   - Library source: `@mediapipe/hands` loaded from the jsDelivr CDN
   - What it provides: frame-by-frame hand landmarks, joint positions, and movement flow

2. Custom heuristic digital twin scoring model
   - Purpose: convert camera-derived movement patterns into clinical-style signals
   - Used in: `src/utils/metrics.js`
   - This is not a trained ML model in this repo. It is a rule-based scoring system using baseline comparison and deviation logic.

### API usage in this repo
The frontend is designed to optionally talk to a backend service through the environment variable:

- `VITE_API_BASE_URL`

If that variable is set, the app can call endpoints such as:

- `POST /api/detect`
- `POST /api/features`
- `POST /api/risk`
- `GET /api/digital-twin`
- `POST /api/explain`
- `POST /api/simulate`

These are referenced in `src/pages/DemoPage.jsx` and `src/pages/TechnologyPage.jsx`.

### Important note
- This repository currently contains the frontend demo and local scoring logic.
- It does not include a production AI backend or cloud model deployment.
- If you are using a backend API, that service should be hosted separately and its base URL should be provided through `VITE_API_BASE_URL`.
- No OpenAI or Azure OpenAI API key is wired into the current front-end code.

## Main metric terms used in the graphs

### 1. HSI (Health Stability Index)
A composite score from 0 to 100 that estimates how stable the patient is relative to their baseline.

- Higher values = better stability
- Lower values = stronger decline signal
- It is computed from deviations in walking speed, activity, sitting duration, balance, posture, stride, tremor, fatigue, and movement variability.

### 2. Risk Score
A separate risk indicator from 0 to 100 that represents the likelihood of deterioration.

- Higher values = more concern
- Lower values = more stable condition
- The score increases when metrics drop or rise beyond expected baselines.

### 3. Severity Score
A normalized deviation score showing how far the current state is from the patient's baseline behavior.

- Higher values = stronger deviation from baseline
- It acts as a more detailed “distance from normal” signal.

### 4. Walking Speed
Movement velocity estimate during tracking.
- Works as one of the strongest mobility signals.
- Lower speed than baseline may indicate decline.

### 5. Activity Level
Estimated motion intensity or engagement level.
- Lower activity suggests lower physical participation or wellbeing.

### 6. Sitting Duration
How long the patient appears to spend sitting.
- Elevated sitting time may indicate reduced movement or possible decline.

### 7. Balance Score
An estimated stability measure based on body posture and wrist movement consistency.
- Lower balance score indicates weaker stability.

### 8. Tremor Index
A rough measure of movement instability or jitter.
- Higher values suggest more irregular or shaky motion.

### 9. Gait Rhythm
A score that reflects movement smoothness and rhythm continuity.
- Lower rhythm means more irregular walking or motion pattern.

### 10. Posture Stability
How stable the posture appears in the tracked movement.
- Lower scores indicate poor alignment or greater energy shift.

### 11. Step Stride
Estimated step distance or stride consistency.
- Lower stride than baseline can suggest reduced mobility.

### 12. Fatigue Index
A rough estimate of fatigue based on slower movement and higher irregularity.
- Higher values imply more tiredness or reduced resilience.

### 13. Movement Variability
A measure of how inconsistent motion is over time.
- More variability can signal instability or erratic movement patterns.

## How the workflow works

1. Webcam access is enabled in the browser.
2. MediaPipe Hands extracts landmarks from the user hand motion.
3. Movement signals are converted into metrics such as speed, posture, rhythm, and variability.
4. The app compares those live values against a baseline profile.
5. HSI, risk, and severity values are calculated.
6. Trend charts display the recent health trajectory.
7. Alerts are generated when deviations remain sustained over time.
8. Reports can be downloaded for caregiver or doctor review.

## Files of interest

- `src/components/CameraTracker.jsx` — webcam + MediaPipe tracking
- `src/utils/metrics.js` — metric normalization and scoring logic
- `src/components/LiveCharts.jsx` — charts used for HSI/risk/severity visualization
- `src/pages/PatientDashboard.jsx` — patient UI dashboard
- `src/pages/CaretakerDashboard.jsx` — caretaker monitoring dashboard
- `src/pages/DoctorDashboard.jsx` — doctor monitoring dashboard
- `src/utils/reports.js` — report and CSV generation

## Environment setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Notes for demo and judge presentation

- The current version is a front-end demonstration of a preventive health tracking workflow.
- The model is intentionally explainable and lightweight rather than a deep clinical-grade medical AI.
- It is best positioned as a demo concept for preventive monitoring, clinician support, and digital-twin style visualization.
