"use server";
import prisma from "@/lib/prisma";
export async function create() {
  // ...
  await prisma.train.create({
    data: {
      name: "Test Train",
    },
  });
}

export async function bookSeat(seatNo: number) {
  // ...
  await prisma.seats.create({
    data: {
      seatNo,
      trainId: "7302958c-a9ab-4e85-b13d-28de0678d685",
    },
  });
}

export async function getAvailableSeats() {
  // ...
  const data = await prisma.seats.findMany({
    where: {
      trainId: "7302958c-a9ab-4e85-b13d-28de0678d685",
    },
  });
  return data;
}
