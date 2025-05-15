# Photo AI Editor

A full-stack web application for AI-powered photo editing, built with React and NestJS.

## Project Overview

This project consists of two main components:
- A React-based frontend application (`client/`)
- A NestJS-based backend server (`server/`)

The application allows users to upload and edit photos using AI-powered features, with a modern and intuitive user interface.

## Screenshots

### Main Interface
### AI Editing Features
![AI Editing](screenshots/ai-editing.png)
*AI-powered editing features in action*

### Results Preview
![Results](screenshots/results.png)
*Preview of the edited photos with AI enhancements*

## Tech Stack

### Frontend (Client)
- React 18
- Material-UI (MUI) for UI components
- React Webcam for camera integration
- React Dropzone for file uploads
- Emotion for styled components

### Backend (Server)
- NestJS framework
- TypeScript
- OpenAI integration
- Sharp for image processing
- Jest for testing
- ESLint and Prettier for code formatting

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- OpenAI API key (for AI features)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd photo_ai
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
npm install
```

### Environment Setup

1. Create a `.env` file in the server directory with the following variables:
```
OPENAI_API_KEY=your_api_key_here
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run start:dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Development

### Frontend Development
- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production

### Backend Development
- `npm run start:dev` - Start development server with hot-reload
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run build` - Build for production

## Project Structure

```
photo_ai/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # React components
│       ├── pages/         # Page components
│       └── ...
├── server/                # Backend NestJS application
│   ├── src/              # Source files
│   │   ├── controllers/  # API controllers
│   │   ├── services/     # Business logic
│   │   └── ...
│   └── test/             # Test files
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers. 