/**
 * Scalyo - KanbanBoardView
 * Extracted from app.html (lines 5552-5635)
 */

import { T } from '../shared/i18n-wrapper.js';


const KanbanBoardView = ({accounts=[], lang="fr", tasks=[], onUpdate, onAdd}) => {
  const [dragItem, setDragItem] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editTask, setEditTask] = React.useState(null);

  // Répartir les tâches en colonnes kanban basé sur quadrant + done
  const todo = tasks.filter(t => !t.done && (t.quadrant === "q3" || t.quadrant === "q4"));
  const inProgress = tasks.filter(t => !t.done && (t.quadrant === "q1" || t.quadrant === "q2"));
  const done = tasks.filter(t => t.done);
  const columns = {todo, in_progress: inProgress, done};

  const handleDragStart = (e, task, fromCol) => { setDragItem({task, fromCol}); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e, toCol) => {
    e.preventDefault();
    if (!dragItem) return;
    const {task, fromCol} = dragItem;
    if (fromCol === toCol) { setDragItem(null); return; }
    let updated;
    if (toCol === "done") updated = {...task, done: true};
    else if (toCol === "in_progress") updated = {...task, done: false, quadrant: task.quadrant === "q3" || task.quadrant === "q4" ? "q1" : task.quadrant};
    else updated = {...task, done: false, quadrant: task.quadrant === "q1" || task.quadrant === "q2" ? "q3" : task.quadrant};
    const newTasks = tasks.map(t => t.id === task.id ? updated : t);
    onUpdate(newTasks);
    setDragItem(null);
  };

  const colConfig = [
    {key: "todo", label: T("todoCol", lang), color: C.amber, icon: "⏳"},
    {key: "in_progress", label: T("inProgressCol", lang), color: C.blue, icon: "🔄"},
    {key: "done", label: T("doneCol", lang), color: C.green, icon: "✅"}
  ];

  return React.createElement("div", {className: "fade-in", style: {padding: 20, height: "100%", overflow: "auto"}},
    React.createElement("div", {style: {display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18}},
      React.createElement("h2", {style: {fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px"}}, "📋 ", T("taskboard", lang)),
      React.createElement("button", {
        onClick: () => { setEditTask(null); setShowAdd(true); },
        style: {display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: C.teal, color: "#FFFFFF", fontSize: 12, fontWeight: 800, border: "none", cursor: "pointer"}
      }, "+ " + T("newTask", lang))
    ),
    React.createElement("div", {style: {display: "flex", gap: 14, minHeight: 400}},
      colConfig.map(col =>
        React.createElement("div", {
          key: col.key,
          onDragOver: e => e.preventDefault(),
          onDrop: e => handleDrop(e, col.key),
          style: {flex: 1, background: C.surface, borderRadius: 8, padding: 14, border: `1px solid ${C.border}`, minHeight: 300, overflow: "auto"}
        },
          React.createElement("div", {style: {fontSize: 13, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: col.color}},
            col.icon, " ", col.label,
            React.createElement("span", {style: {fontSize: 11, background: `${col.color}22`, border: `1px solid ${col.color}44`, padding: "2px 8px", borderRadius: 16, color: col.color, fontWeight: 700}},
              columns[col.key].length)
          ),
          columns[col.key].length === 0
            ? React.createElement("div", {style: {fontSize: 12, color: C.muted, textAlign: "center", padding: 20, border: `1px dashed ${C.border}`, borderRadius: 8}}, T("noTasks", lang))
            : columns[col.key].map(task => {
                const taskColor = TASK_COLORS.find(c => c.id === task.color) || TASK_COLORS[0];
                return React.createElement("div", {
                  key: task.id,
                  draggable: true,
                  onDragStart: e => handleDragStart(e, task, col.key),
                  onClick: () => { setEditTask(task); setShowAdd(true); },
                  style: {background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${taskColor.hex}`, borderRadius: 6, padding: "12px 14px", marginBottom: 8, cursor: "grab", transition: "border-color .15s"}
                },
                  React.createElement("div", {style: {fontSize: 13, fontWeight: 600, marginBottom: 4, textDecoration: task.done ? "line-through" : "none", opacity: task.done ? 0.6 : 1}}, task.title),
                  React.createElement("div", {style: {fontSize: 11, color: C.muted, display: "flex", justifyContent: "space-between", alignItems: "center"}},
                    React.createElement("span", null, task.account || ""),
                    task.dueDate ? React.createElement("span", {style: {color: new Date(task.dueDate) < new Date() && !task.done ? C.red : C.muted}}, "📅 " + task.dueDate) : null
                  )
                );
              })
        )
      )
    ),
    showAdd && React.createElement(AddTaskModal, {
      lang, accounts,
      editTask: editTask ? {...editTask} : {quadrant: "q1"},
      onClose: () => { setShowAdd(false); setEditTask(null); },
      onAdd: task => { onAdd(task); setShowAdd(false); setEditTask(null); }
    })
  );
};

