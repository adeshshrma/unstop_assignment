"use client";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { bookSeat, create, getAvailableSeats } from "@/api/home";
import { useEffect, useRef, useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
export default function Home() {
  const SeatsRef = useRef<number>(0);

  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const getStatus = async () => {
    const data = await getAvailableSeats();
    console.log(data);

    setAvailableSeats(data);
  };
  useEffect(() => {
    getStatus();
  }, []);

  const returnSeatStatus = () => {
    const seats = Array(12)
      .fill(false)
      .map((row, index) => {
        if (index === 11) {
          return Array(3)
            .fill(false)
            .map((seat, rowIndex) => {
              let currentSeat = index * 7 + (rowIndex + 1);
              let seatBooked = false;
              availableSeats.map((seat) => {
                if (seat.seatNo === currentSeat) {
                  seatBooked = true;
                }
              });
              if (seatBooked) {
                return true;
              } else {
                return false;
              }
            });
        } else {
          return Array(7)
            .fill(false)
            .map((seat, rowIndex) => {
              let currentSeat = index * 7 + (rowIndex + 1);
              let seatBooked = false;
              availableSeats.map((seat) => {
                if (seat.seatNo === currentSeat) {
                  seatBooked = true;
                }
              });
              if (seatBooked) {
                return true;
              } else {
                return false;
              }
            });
        }
      });
    console.log(seats);

    return seats;
  };

  const submit = () => {
    if (80 - availableSeats.length < SeatsRef.current) {
      setErr("Not enough seats available");
    } else {
      bookTickets();
    }
  };

  const bookTickets = async () => {
    // console.log(SeatsRef.current);
    console.log(availableSeats);
    const seats = returnSeatStatus();
    setOpen(true);
    // Prioritize booking in a single row
    const availableRow = seats.find(
      (row) => row.filter((seat) => !seat).length >= SeatsRef.current
    );

    if (availableRow) {
      console.log("book in row");

      const currentRow = seats.indexOf(availableRow);

      const startIndex = currentRow * 7 + (availableRow.indexOf(false) + 1);

      for (let i = startIndex; i < startIndex + SeatsRef.current; i++) {
        await bookSeat(i);
      }
    } else {
      // If not possible, book consecutive seats across multiple rows
      console.log("book in custom row");

      let currentRow = 0;
      let seatBooked = 0;
      while (currentRow < seats.length && seatBooked < SeatsRef.current) {
        console.log(seatBooked, "booked seat");

        const availableSeats = seats[currentRow].filter((seat) => !seat).length;
        if (availableSeats > 0) {
          console.log("available seats", availableSeats);
          console.log("currentRow", currentRow);

          const startIndex =
            currentRow * 7 + (seats[currentRow].indexOf(false) + 1);
          for (
            let i = startIndex;
            i < startIndex + availableSeats && seatBooked < SeatsRef.current;
            i++
          ) {
            seatBooked++;
            await bookSeat(i);
          }
        }
        currentRow++;
      }
    }
    await getStatus();
    setShowStatus(true);
    setOpen(false);
  };

  return (
    <main className="w-full flex justify-center items-center min-h-[100vh]">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {!showStatus ? (
        <div className="flex gap-2 flex-col">
          <h1 className="font-semibold italic">
            Available Seats: {80 - availableSeats.length}
          </h1>
          <h1 className="font-semibold italic">Enter No of seats</h1>
          <TextField
            id="standard-basic"
            size="small"
            variant="outlined"
            type="number"
            onChange={(e) => {
              SeatsRef.current = Number(e.target.value);
            }}
          />
          {err ? (
            <p className="text-red-500 italic font-semibold">{err}</p>
          ) : null}
          <Button variant="outlined" onClick={submit}>
            Submit
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-col">
          <h1 className="font-semibold italic mb-4">
            {SeatsRef.current} Seats Booked
          </h1>
          {returnSeatStatus().map((row, index) => {
            return (
              <div key={index} className="flex gap-4">
                {row.map((seat, index) => (
                  <div key={index}>
                    {seat ? (
                      <div className="rounded-full w-4 h-4 bg-red-700"></div>
                    ) : (
                      <div className="rounded-full w-4 h-4 bg-green-700"></div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
          <Button
            variant="outlined"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </main>
  );
}
