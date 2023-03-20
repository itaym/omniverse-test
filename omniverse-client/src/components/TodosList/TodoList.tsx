import React, { useEffect, useState } from 'react';
import Style from './TodoList.module.scss'
import TodoListItem from './TodoListItem';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { Todo } from '../../types'

interface ListProps {
    items: Todo[];
    onItemMove: Function,
    className: string,
    onDelete?: any
}

const TodoList: React.FC<ListProps> =
    ({ items, onItemMove, className, onDelete = async (todo:Todo) => {} }) => {
    const [list, setList] = useState(items);
    const [hovered, setHovered] = useState(0)
    let hoveredIndex
    const moveItem = (dragIndex: number, hoverIndex: number) => {
        const dragItem = list[dragIndex];
        const hoverItem = list[hoverIndex]

        onItemMove(dragItem, hoverItem)
        setList((prevState:Todo[]) => {
            const newItems = prevState.filter((_, index) => index !== dragIndex);
            newItems.splice(hoverIndex, 0, dragItem);

            return newItems;
        });
    };

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.LIST_ITEM,
        hover: ({ index: hoverIndex }: { index: number }) => {
            hoveredIndex = hoverIndex
        },
        drop: ({ index: dragIndex }: { index: number }) => {
            moveItem(dragIndex, hovered);
        },
        collect: (monitor:DropTargetMonitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    useEffect(() => {
        setList(items)
    }, [items])

    return (
        <div className={className + ' ' + Style.todoList} ref={drop}>
            {list.map((item:Todo, index:number) => (
                <TodoListItem
                    index={index}
                    key={item.id}
                    onDelete={onDelete}
                    setHovered={setHovered}
                    todo={item}
                />
            ))}
        </div>
    );
};

export default TodoList
