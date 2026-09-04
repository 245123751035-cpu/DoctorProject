import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-700 mb-4">404</h1>
      <p className="text-lg text-foreground mb-6">
        The page you are looking for could not be found.
      </p>
      <Link href="/" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
