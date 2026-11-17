export function FormError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="px-4 text-[15px] text-red">
      {msg}
    </p>
  );
}
