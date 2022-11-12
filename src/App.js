import { useState } from 'react'
import styled from 'styled-components'
import Chessboard from 'chessboardjsx'
// import * as Chess from 'chess.js'
import { Chess } from 'chess.js'
import MovesHistory from './components/MovesHistory'
import { onSnapshot, collection, doc, getDoc, updateDoc } from 'firebase/firestore'

import { db } from './firebase'
import { useEffect } from 'react'

const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const App = () => {
  const [position, setPosition] = useState(startingPosition);
  const [chessBoard, setChessBoard] = useState(new Chess())
  const [movesHistory, setMovesHistory] = useState([])

  const gameRef = doc(db, 'games', 'gameDoc')


  useEffect(() => {
    resetGame()
    const unsubscribe = onSnapshot(gameRef, snapshot => {
      setPosition(snapshot.data().currentPosition)
      setMovesHistory(snapshot.data().gameHistory)
      chessBoard.load_pgn(snapshot.data().pgn)
    })

    return () => unsubscribe()
  }, [])


  const updateChessBoardOnMove = async ( sourceSquare, targetSquare) => {
    const interChessBoard = new Chess()
    const gameSnap = await getDoc(gameRef)

    interChessBoard.load_pgn(gameSnap.data().pgn)
    interChessBoard.move({ from: sourceSquare, to: targetSquare })

    updateDoc(gameRef, {
      currentPosition: interChessBoard.fen(),
      pgn: interChessBoard.pgn(),
      gameHistory: interChessBoard.history()
    })

  }


  const resetGame = async () => {
    await updateDoc(gameRef, {
      currentPosition: startingPosition,
      pgn: '',
      gameHistory: [],
    })
  }
  
  return (
    <Wrapper>
      <Main>
      <Heading>
        <h1>Albert Rocha's Chess Game</h1>
      </Heading>
      <Chessboard 
        position={position}
        onDrop={drop => {
          updateChessBoardOnMove(drop.sourceSquare, drop.targetSquare)
          const moveInfo = chessBoard.move({ from: drop.sourceSquare, to: drop.targetSquare})

          setPosition(chessBoard.fen())
        }}
      />
      <MovesHistory chessBoard={chessBoard} setPosition={setPosition} movesHistory={movesHistory} />
      </Main>
      <ResetButton onClick={resetGame}>Reset Game</ResetButton>
    </Wrapper>
    )
}

export default App;


const Wrapper = styled.div`
  background-color: #282c34;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Main = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Heading = styled.div`
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-size: 0.5em;
`


const ResetButton = styled.button ``
