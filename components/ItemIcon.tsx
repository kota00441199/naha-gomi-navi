import type { ItemId } from '@/lib/rules';
export function ItemIcon({ id }: {
    id: ItemId;
}) {
    const paths: Record<ItemId, React.ReactNode> = {
        pet: <><path d="M10 3h4v4l3 4v9H7v-9l3-4Z"/><path d="M7 13h10M7 16h10M10 5h4"/></>,
        can: <><ellipse cx="12" cy="5" rx="6" ry="2"/><path d="M6 5v14c0 3 12 3 12 0V5M9 10h6M9 13h6"/></>,
        glass: <><path d="M10 3h4v6l3 3v9H7v-9l3-3ZM10 6h4M7 15h10"/></>,
        newspaper: <><path d="M4 4h14v16H4ZM18 8h3v12h-3M7 7h8M7 10h8M7 13h3v4H7ZM13 13h2M13 16h2"/></>,
        cardboard: <><path d="m3 7 9-4 9 4v11l-9 4-9-4ZM3 7l9 4 9-4M12 11v11M8 5l9 4"/></>,
        carton: <><path d="M8 3h8l3 5v13H5V8ZM8 3v5H5M8 8h11M9 12h6v5H9Z"/></>,
    };
    return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}
