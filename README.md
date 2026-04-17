# Multiplayer Tic-Tac-Toe with Nakama & React

A full-stack, real-time multiplayer game built using **Nakama Server** (Backend) and **React** (Frontend). This project demonstrates real-time state synchronization, matchmaking, and turn-based validation.

## 🏗 Project Structure (Monorepo)
- `/nakama-tictactoe-server`: TypeScript-based Nakama runtime modules handling game logic, win detection, and move validation.
- `/tictactoe-client`: React (TypeScript) frontend using Tailwind CSS for UI and Nakama-JS SDK for real-time communication.

## 🚀 Technical Highlights
- **Real-time Sync:** Uses WebSockets to broadcast game state changes instantly to both players.
- **Server-Side Validation:** The server identifies players by their Nakama Session ID to prevent players from moving out of turn.
- **Automated Matchmaking:** Uses Nakama's Matchmaker to pair two players into a private match instance.
- **Monorepo Workflow:** Both client and server live in one repository for easier deployment and version control.

## 🛠 Deployment
### Backend (Nakama on Render)
- **Environment:** Docker
- **Root Directory:** `nakama-tictactoe-server`
- **Docker Context:** `nakama-tictactoe-server`

### Frontend (Static Site on Render)
- **Root Directory:** `tictactoe-client`
- **Build Command:** `npm run build`
- **Publish Directory:** `build`
