# Yearn Charts

Yearn Charts is a React application that visualizes APY (Annual Percentage Yield) data for Yearn Finance vaults using Chart.js and Tailwind CSS. The application allows users to select different vaults and view their historical APY performance over various timeframes.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Built With](#built-with)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Demo

A live version of the application is available at: [https://yearn-charts.vercel.app](https://yearn-charts.vercel.app)

## Features

- **Vault Selection**: Browse and search Yearn Finance vaults grouped by asset, chain, and API version.
- **APY Visualization**: Interactive charts displaying historical APY data with options to select different timeframes (7 days, 30 days, 180 days, max).
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.
- **Lazy Loading**: Components are lazy-loaded for performance optimization.
- **Error Handling**: Comprehensive error handling and loading states for a smooth user experience.

## Installation

To get a local copy up and running, follow these steps.

### Prerequisites

- **Node.js** (version 14.x or higher)
- **npm** (comes with Node.js) or **Yarn**

### Clone the Repository

```bash
git clone https://github.com/rossgalloway/yearn-charts.git
cd yearn-charts
```

### Install Dependencies

Using npm:

```bash
npm install
```

## Usage

### Running the Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Building for Production

Build the app for production to the `dist` folder:

```bash
npm run build
```

### Previewing the Production Build

Locally preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run format`: Formats the codebase using Prettier.
- `npm run stitch`: Builds an markdown file of the codebase for AI input

## Built With

- React - JavaScript library for building user interfaces.
- TypeScript - Strongly typed programming language that builds on JavaScript.
- Vite - Fast frontend build tool and development server.
- Apollo Client - State management library for JavaScript apps, for interacting with GraphQL - APIs.
- Shadcn Charts - Flexible charting library using Recharts.
- Tailwind CSS - Utility-first CSS framework.
- React Router DOM - Declarative routing for React.
- ESLint - Pluggable linting utility for JavaScript and JSX.
- Prettier - Opinionated code formatter.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository

2. Create a new branch

    ```bash
    git checkout -b feature/YourFeature
    ```

3. Commit your changes

    ```bash
    git commit -m 'Add some feature'
    ```

4. Push to the branch

    ```bash
    git push origin feature/YourFeature
    ```

5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

❤️ to Zootroop and Kong Team for providing the API and data.
