import { Link } from "react-router";

const STORE_ID = import.meta.env.VITE_STORE_ID;

export default function Home() {
  return (
    <main className="mx-auto max-w-sm p-4 min-h-[100dvh] flex flex-col justify-start">
      <h1 className="text-2xl font-bold text-center">かき氷注文システム</h1>
      <Link to={"/order/" + STORE_ID}>
        <button className="mt-8 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          注文する
        </button>
      </Link>
    </main>
  );
}
