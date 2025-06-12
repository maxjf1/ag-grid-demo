import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Console } from 'webr';

interface ICar {
  make: string;
  model: string;
  price: number;
  previousPrice: string;
  electric: boolean;
}

const initialRowData: ICar[] = [
  { make: "Tesla", model: "Model Y", price: 64950, previousPrice: '🔹', electric: true },
  { make: "Ford", model: "F-Series", price: 33850, previousPrice: '🔹', electric: false },
  { make: "Toyota", model: "Corolla", price: 29600, previousPrice: '🔹', electric: false },
  { make: "Chevrolet", model: "Bolt EV", price: 31995, previousPrice: '🔹', electric: true },
  { make: "Nissan", model: "Leaf", price: 27490, previousPrice: '🔹', electric: true },
  { make: "BMW", model: "i3", price: 44450, previousPrice: '🔹', electric: true },
  { make: "Volkswagen", model: "ID.4", price: 39900, previousPrice: '🔹', electric: true },
  { make: "Hyundai", model: "Kona Electric", price: 34900, previousPrice: '🔹', electric: true },
  { make: "Kia", model: "Niro EV", price: 39990, previousPrice: '🔹', electric: true },
  { make: "Audi", model: "e-tron", price: 65900, previousPrice: '🔹', electric: true },
];

const useInterval = (callback: () => void, delay: number) => {
  useEffect(() => {
    const newInterval = setInterval(callback, delay);
    return () => clearInterval(newInterval);
  }, [callback, delay]);
}

const useRConsole = (): [Console | null, string[], React.Dispatch<React.SetStateAction<string[]>>] => {
  const [console, setConsole] = useState<Console | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    const webRConsole = new Console({
      stdout: line => setOutput(prev => [...prev, line]),
      stderr: line => setOutput(prev => [...prev, `❗${line}`]),
      prompt: p => setOutput(prev => [...prev, `🔹${p}`]),
    });
    webRConsole.run();
    setConsole(webRConsole);
    return () => {
      webRConsole.interrupt();
    }
  }, []);

  return [console, output, setOutput];
}

function App() {
  const [rowData, setRowData] = useState<ICar[]>(initialRowData)
  const [code, setCode] = useState<string>('');
  const [console, output, setOutput] = useRConsole();
  const scrollRef = useRef<HTMLPreElement>(null);
  const handleRun = () => {
    if (console && code) {
      setOutput(prev => [...prev, `🔹${code}`])
      console.stdin(code)
      setCode(''); // Clear the input after running
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100); // Scroll to the bottom after a short delay
    }
  }
  const [columnDefs, setColumnDefs] = useState<ColDef<ICar>[]>([
    { field: 'make', headerName: 'Make' },
    { field: 'model', headerName: 'Model' },
    { field: 'price', headerName: 'Price' },
    { field: 'previousPrice', headerName: 'Previous Price' },
    { field: 'electric', headerName: 'Electric' }
  ]);

  useInterval(() => {
    // Simulate updating the row data every 5 seconds
    const updatedRowData = rowData.map(car => {
      const newPrice = car.price + Math.floor((Math.random() - 0.5) * 1000) // Randomly increase the price
      return {
        ...car,
        previousPrice: `${newPrice < car.price ? '🔺' : '🔻'} ${(100 - (100) / car.price * newPrice).toFixed(2)}%`, // Store the previous price
        price: newPrice
      }
    });
    setRowData(updatedRowData);
  }, 5000);



  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleRun();
        }}>
          <pre ref={scrollRef} style={{ width: '80vw', overflow: 'auto', height: 300, fontSize: 12, textAlign: 'left', background: 'lightgray', color: 'black', padding: 10 }}>
            {output.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </pre>
          <input
            type='text'
            value={code}
            placeholder='Type your R code here...'
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit">Run</button>
        </form>
        <hr />
        <div style={{ height: 500, width: '80vw' }}>
          <AgGridReact
            rowData={rowData}
            onRowSelected={(event) => { }}
            columnDefs={columnDefs}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
