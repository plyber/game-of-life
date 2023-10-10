import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, OnDestroy {

  grid: number[][] = [];
  @Input() numRows: number; //Se poate lega cu interfața pentru opțiunile grilei
  @Input() numCols: number; //idem
  generation = 0;
  history: number[][][] = [];
  timerSubscription: Subscription;
  running = false;

  ngOnInit(): void {
    this.initializeGrid();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initializeGrid() { //Se poate lega cu interfața pentru opțiuni de generare
    for (let i = 0; i < this.numRows; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.numCols; j++) {
        this.grid[i][j] = Math.random() < 0.5 ? 0 : 1; // Inițializează celulele aleatoriu;
      }
    }
    this.history.push(this.grid);
  }

  start() {
    if (!this.running) {
      this.running = true;
      const timer = interval(1000); //Se poate lega cu interfața pentru opțiuni de simulare
      this.timerSubscription = timer.subscribe(() => {
        this.updateGeneration();
        this.nextGeneration();
      });
    }
  }

  stop() {
    this.grid = this.history[this.history.length - 1];
    if (this.running) {
      this.running = false;
      this.timerSubscription.unsubscribe();
    }
  }

  rewind(index: number): void {
    if (index >= 0 && index < this.history.length) {
      this.grid = this.history[index];
    }
  }

  reset() {
    if (this.running) {
      this.stop();
    }
    this.generation = 0;
    this.history = [];
    this.initializeGrid();
    console.log(this.history)
  }

  latestGeneration() {
    return this.grid === this.history[this.history.length - 1];
  }

  toggleCell(rowIndex: number, colIndex: number) {
    this.grid[rowIndex][colIndex] = this.grid[rowIndex][colIndex] === 1 ? 0 : 1;
  }

  updateGeneration() {
    this.generation++;
  }

  nextGeneration() {
    const newGrid: number[][] = [];
    let sterile = true;

    for (let i = 0; i < this.numRows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < this.numCols; j++) {
        const neighbors = this.countNeighbors(i, j);
        if (this.grid[i][j] === 1) {
          if (neighbors < 2 || neighbors > 3) {
            newGrid[i][j] = 0;
          } else {
            newGrid[i][j] = 1;
            sterile = false;
          }
        } else {
          if (neighbors === 3) {
            newGrid[i][j] = 1;
            sterile = false;
          } else {
            newGrid[i][j] = 0;
          }
        }
      }
    }

    if (sterile) {
      this.timerSubscription.unsubscribe()
    }
    this.grid = newGrid;
    this.history.push([...this.grid])
  }

  countNeighbors(row: number, col: number): number {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }
        const newRow = row + i;
        const newCol = col + j;

        if (newRow >= 0 && newRow < this.numRows && newCol >= 0 && newCol < this.numCols) {
          count += this.grid[newRow][newCol];
        }
      }
    }
    return count;
  }
}

