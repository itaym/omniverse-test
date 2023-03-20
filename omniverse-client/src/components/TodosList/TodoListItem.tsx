import React, { useCallback, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { Todo } from '../../types'
import Style from './TodoList.module.scss'

interface ListItemProps {
    todo: Todo;
    index: number;
    setHovered: (index: number) => void;
    onDelete?: (todo:Todo) => Promise<void>;
}

const TodoListItem: React.FC<ListItemProps> = ({ todo, index, setHovered, onDelete }) => {
    const { id } = todo
    const [isDragging, setIsDragging] = useState(false);
    // @ts-ignore
    const [{ opacity }, drag] = useDrag({
        item: { id, index, type: ItemTypes.LIST_ITEM },
        collect: (monitor: any) => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
        type: ItemTypes.LIST_ITEM,
        end: () => setIsDragging(false),
    }) as any;

    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.LIST_ITEM,
        canDrop: () => false,
        hover: (item: { id: string; index: number }) => {
            setHovered(index)
        },
        collect: (monitor: DropTargetMonitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const removeTodo = useCallback(async () => {
        if (onDelete) {
            await onDelete(todo)
        }
    }, [todo])

    const getBackgroundColor = () => {
        if (isDragging) {
            return '#F5F5F5';
        } else if (isOver) {
            return '#E0E0E0';
        } else {
            return '#000000';
        }
    };

    return (
        <div className={Style.listItem} ref={drop} style={{ backgroundColor: getBackgroundColor() }}>
            <div className={Style.x} onClick={removeTodo}>X</div>
            <div ref={drag} style={{ opacity }}>
                {todo.title}
            </div>
        </div>
    );
};

export default TodoListItem;