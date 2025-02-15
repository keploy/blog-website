
interface NavItemProps {
  name: string;
}

export default function NavItem({ name }: NavItemProps) {
  return (
    <div>
      <h1 className={`font-bold  'text-gray-800' hover:text-primary-300`}>
        {name}
      </h1>
    </div>
  );
}
