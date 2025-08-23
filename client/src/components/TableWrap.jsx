export default function TableWrap({ children, min = 720 }) {
  return (
    <div className="overflow-x-auto w-full">
      <div className={`min-w-[${min}px]`}>{children}</div>
    </div>
  );
}
