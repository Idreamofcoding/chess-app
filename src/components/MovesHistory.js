import styled from "styled-components";
import { useState } from "react";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Chess } from 'chess.js'

const gameRef = doc(db, 'games', 'gameDoc')

const MovesHistory = ({ chessBoard, setPosition, movesHistory }) => {
    const [undoMovesHistory, setUndoMovesHistory] = useState([])


    const numberMovesColumn = moves => {
        const plysToMoveCount = moves.length % 2 === 0 ? moves.length / 2 : Math.ceil(moves.length / 2)
        console.log(plysToMoveCount)

        const turnCount = Array.from(Array(plysToMoveCount).keys()).map(
            num => num + 1,
        )

        return turnCount.map(turn => (
            <p style={{ color: 'pink', fontSize: 20}}>{turn}</p>
        ))
    }
    const evenMovesColumn = moves => 
        moves.filter((_, index) => index % 2 === 0)
        .map(move => <p style={{ color: '#bababa', fontSize: 20}}>{move}</p>)
    
    const oddMovesColumn = moves => {
        return moves.filter((_, index) => index % 2 === 1)
        .map(move => <p style={{ color: '#bababa', fontSize: 20}}>{move}</p>)
    }


    const undoStep = async () => {
        const gameSnap = await getDoc(gameRef)
        console.log("gamesnap", gameSnap)

        const interChessBoard = new Chess()
        interChessBoard.load_pgn(gameSnap.data().pgn)
        console.log("inter Chessboard", interChessBoard)

        const lastMove = interChessBoard.undo();
        if (lastMove === null) return
        console.log("last Move", lastMove)

        await updateDoc(gameRef, {
            undoMovesHistory: [...gameSnap.data().undoMovesHistory, lastMove],
            currentPosition: interChessBoard.fen(),
            pgn: interChessBoard.pgn(),
            gameHistory: interChessBoard.history(),
        })


        // const lastMove = chessBoard.undo()

        // setUndoMovesHistory([...undoMovesHistory, lastMove])
        // setPosition(chessBoard.fen())

    }
    const redoStep = async () => {
        const gameSnap = await getDoc(gameRef)

        const interChessBoard = new Chess()
        interChessBoard.load_pgn(gameSnap.data().pgn)

        const tempUndo = [...gameSnap.data().undoMovesHistory]
        if (tempUndo.length === 0) return

        const { flags, from, to } = tempUndo.pop()

        interChessBoard.move({ from, to })

        await updateDoc(gameRef, {
            undoMovesHistory: tempUndo,
            currentPosition: interChessBoard.fen(),
            pgn: interChessBoard.pgn(),
            gameHistory: interChessBoard.history()
        })
    }

    return (
        <Wrapper>
            <MovesContainer>
                <div style={{
                    flex: 1,
                    backgroundColor: '#302e2c',
                    textAlign: 'center',
                    height: '100',
                }}>
                    {numberMovesColumn(movesHistory)}
                </div>
                <div style={{
                    flex: 2,
                    marginLeft: 10
                }}>
                    <h2 style={{ color: '#438987' }}>Player 1</h2>
                    {evenMovesColumn(movesHistory)}
                </div>
                <div style={{
                    flex: 2
                }}>
                    <h2 style={{ color: '#7edf8f' }}>Player 2</h2>
                    {oddMovesColumn(movesHistory)}
                </div>
            </MovesContainer>
            <ActionButtonsContainer>
                <ActionButton onClick={() => undoStep()}>👈</ActionButton>
                <ActionButton onClick={() => redoStep()}>👉</ActionButton>

            </ActionButtonsContainer>

        </Wrapper>
    )
}

export default MovesHistory

const Wrapper = styled.div `
    display: flex;
    flex-direction: column;
    margin-top: 70px;
`

const MovesContainer = styled.div `
    width: 400px;
    display: flex;
    justify-content: space-between;
    margin-left: 20px;
    background-color: #262421;
    height: 62vh;
    
`

const ActionButtonsContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const ActionButton = styled.button `
    background: none;
    border: none;
    outline: none;
    font-size: 50px;
    &:hover{
        cursor: pointer;
    }
`