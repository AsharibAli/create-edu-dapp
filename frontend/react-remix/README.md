# EDU DApp - Remix Version

This project is a comprehensive educational dApp platform built on Remix, featuring blockchain integration for various educational use cases such as classroom polls, study groups, and assignment submissions.

## Features

- OCID Connect authentication
- MetaMask wallet integration
- Multiple educational dApps:
  - Simple Greeting
  - Classroom Polls
  - Study Time Tracker
  - Assignment Submission
  - Study Group Chat

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

## Development Server

Start the development server on http://localhost:5173:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev
```

## Production Build

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build
```

## Locally Preview Production Build

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview
```

## Project Structure

```
react-remix/
├── app/
│   ├── components/        # Reusable UI components
│   ├── contracts/         # Smart contract ABIs
│   ├── lib/              # Utility functions
│   ├── routes/           # Route components
│   ├── styles/           # Global styles
│   ├── entry.client.tsx  # Client entry
│   ├── entry.server.tsx  # Server entry
│   └── root.tsx          # Root component
├── public/               # Static assets
├── tailwind.config.ts    # Tailwind CSS configuration
└── remix.config.js       # Remix configuration
```

## Smart Contract Integration

The dApp connects to several Solidity smart contracts deployed on the EDUChain network. Each contract serves a specific educational purpose:

- **SimpleGreeting**: Basic blockchain message storage
- **ClassPoll**: Classroom polling system
- **StudyTracker**: Time tracking for study sessions
- **AssignmentSubmission**: Submission and verification system
- **StudyGroup**: Group chat for students

## Authentication

The application uses OpenCampus ID Connect for authentication. Users can log in with their educational credentials before interacting with the blockchain components.

## Wallet Integration

MetaMask is integrated for blockchain interactions. Users need to connect their wallet to:

- Submit transactions
- View blockchain data
- Interact with smart contracts

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_OCID_CLIENT_ID=your-client-id
VITE_OCID_REDIRECT_URI=http://localhost:5173/callback
```

## Customization

### Tailwind Theme

Modify the `tailwind.config.ts` file to customize the application's appearance.

### Components

Custom UI components are located in the `/app/components` directory and can be modified or extended.

## Deployment

The app can be deployed using any platform that supports Remix applications:

```bash
# Build for production
npm run build

# Deploy to your preferred hosting platform
npm run deploy
```

## Testing

Run the test suite:

```bash
# npm
npm run test

# pnpm
pnpm run test

# yarn
yarn test
```

## Troubleshooting

**MetaMask Connection Issues**

- Ensure you have MetaMask installed
- Add the EDUChain network to your MetaMask
- Make sure you're on the correct network

**OCID Authentication Problems**

- Check that your OCID client ID is correct
- Verify the redirect URI matches your application configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenCampus team for the OCID authentication
- EDUChain for the blockchain infrastructure
- Remix team for the framework
