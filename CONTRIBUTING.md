# Contributing

Contributions are welcome when they improve the product, architecture, accessibility, performance, or documentation without weakening the fictional-scenario boundaries.

## Non-negotiable principles

- Keep the simulation clearly labeled as fictional.
- Do not describe visual outputs as forecasts, predictions, warnings, or scientific results.
- Do not add real emergency, victim, casualty, evacuation, or alarmist claims.
- Do not add personal data, credentials, restricted datasets, or unlicensed assets.
- Do not test or deploy against systems you do not own or have permission to use.
- Preserve the distinction between cinematic storytelling and validated domain modeling.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run build
```

## Pull request expectations

Describe:

1. the user, architecture, or performance problem;
2. the files and behavior changed;
3. validation results;
4. desktop and mobile impact;
5. rendering, bundle-size, accessibility, security, and responsible-use impacts;
6. whether any scenario constants or claims changed.

Include screenshots or a short recording for visible changes.

## Scientific or data-model contributions

Do not present a more sophisticated visualization as a validated scientific model. Any proposal involving real datasets, bathymetry, hazards, emergency operations, or predictive claims requires documented provenance, domain review, uncertainty treatment, and a separate product classification.
