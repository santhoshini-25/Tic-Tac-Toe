import React, { useState, useCallback, useEffect } from 'react';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';

const NAKAMA_HOST = 'tictactoe-nakama-yk4h.onrender.com';
const SERVER_KEY = 'defaultkey';
const PORT = '443'; 

interface GameState {
  board: number[];
  nextPlayer: number;
  winner: number;
  presences: Record<string, any>;
}

function App() {
  const [client] = useState(new Client(SERVER_KEY, NAKAMA_HOST, PORT, true));
  const [session, setSession] = useState<Session | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('Player');
  const [status, setStatus] = useState('Enter name to play!');
  const [matchId, setMatchId] = useState('');
  const [myPlayerNumber, setMyPlayerNumber] = useState<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(0),
    nextPlayer: 1,
    winner: 0,
    presences: {}
  });

  const connectSocket = async (currentSession: Session) => {
    const newSocket = client.createSocket(true, false);
    
    newSocket.onmatchdata = (result) => {
      const data = JSON.parse(new TextDecoder().decode(result.data));
      setGameState(data);

      // CRITICAL: Link your session ID to the player number the server assigned
      if (data.presences && currentSession.user_id) {
        const myNum = data.presences[currentSession.user_id];
        if (myNum) {
          setMyPlayerNumber(myNum);
          console.log("I am confirmed as Player:", myNum);
        }
      }
    };

    newSocket.onmatchmakermatched = async (matched) => {
      const match = await newSocket.joinMatch(matched.match_id);
      setMatchId(match.match_id);
      setStatus("Opponent Found! Syncing...");
      
      // Request initial state from server immediately after joining
      newSocket.sendMatchState(match.match_id, 3, JSON.stringify({})); 
    };

    await newSocket.connect(currentSession, true);
    setSocket(newSocket);
  };

  const login = async () => {
    try {
      const deviceId = `${username}-unique-id`; // Simplified for testing
      const newSession = await client.authenticateDevice(deviceId, true, username, {});
      setSession(newSession);
      await connectSocket(newSession);
      setStatus(`Logged in as ${username}`);
    } catch (error) {
      setStatus('Login failed - Try a different name');
    }
  };

  const startMatchmaking = async () => {
    if (!socket) return;
    if (gameState.winner !== 0 && matchId) {
        socket.sendMatchState(matchId, 2, JSON.stringify({})); 
        return;
    }
    try {
      setStatus('Searching for opponent...');
      await socket.addMatchmaker("*", 2, 2);
    } catch (error) {
      console.error(error);
    }
  };

  const makeMove = useCallback((position: number) => {
    if (gameState.nextPlayer === myPlayerNumber && gameState.board[position] === 0 && gameState.winner === 0) {
      socket?.sendMatchState(matchId, 1, JSON.stringify({ position: position + 1 }));
    }
  }, [gameState, socket, matchId, myPlayerNumber]);

  useEffect(() => {
    if (gameState.winner === 1 || gameState.winner === 2) {
      setStatus(`🎉 Player ${gameState.winner} Wins!`);
    } else if (gameState.winner === 3) {
      setStatus("🤝 Draw Game!");
    } else if (matchId) {
      setStatus(gameState.nextPlayer === myPlayerNumber ? "🟢 YOUR MOVE" : "⌛ OPPONENT'S TURN");
    }
  }, [gameState, myPlayerNumber, matchId]);

  const getSymbol = (cell: number) => cell === 1 ? '❌' : cell === 2 ? '⭕' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-black text-white mb-8 tracking-tighter">TIC TAC TOE</h1>
      
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
        {!session ? (
          <div className="space-y-4">
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/50 border-none outline-none focus:ring-2 ring-white/50" placeholder="Username" />
            <button onClick={login} className="w-full p-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-opacity-90 transition-all">START PLAYING</button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <p className="text-white font-bold text-xl">{status}</p>
              <p className="text-white/50 text-xs font-mono">YOU ARE PLAYER: {myPlayerNumber || '?'}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-black/20 p-3 rounded-2xl">
              {gameState.board.map((cell, i) => (
                <button
                  key={i}
                  disabled={cell !== 0 || gameState.winner !== 0 || gameState.nextPlayer !== myPlayerNumber}
                  onClick={() => makeMove(i)}
                  className={`aspect-square text-4xl font-bold flex items-center justify-center rounded-xl transition-all
                    ${cell === 0 && gameState.nextPlayer === myPlayerNumber ? 'bg-white/20 hover:bg-white/30 cursor-pointer' : 'bg-white/5 cursor-not-allowed'}
                    ${cell !== 0 ? 'text-white' : ''}`}
                >
                  {getSymbol(cell)}
                </button>
              ))}
            </div>

            {(gameState.winner !== 0 || !matchId) && (
              <button onClick={startMatchmaking} className="w-full p-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                {gameState.winner !== 0 ? 'PLAY AGAIN' : 'FIND MATCH'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;