"use client";
import React, { useEffect, useState } from "react";
import {
  Mail, Phone, MapPin, User, GraduationCap, Users,
  Copy, Edit2, Save, RefreshCcw, CheckCircle, Trash2, X, PlusCircle, GripVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Interfaces
interface Qualification {
  name: string;
  rate: number;
}
interface Teacher {
  name: string;
  role: string;
  birthDate?: string;
  email: string;
  phone: string;
  address: string;
  privateQualifications: Qualification[];
  groupQualifications: Qualification[];
}
interface Props {
  teacher?: Teacher;
}
interface Toast {
  message: string;
  type: "success" | "info" | "error";
}

// Utility Validators
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);
const validateDate = (date: string) => !isNaN(Date.parse(date));

const TeacherDetails: React.FC<Props> = ({ teacher }) => {
  const [data, setData] = useState<Teacher | null>(teacher ?? null);
  const [activeEditCard, setActiveEditCard] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teacherDetails");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") setData(parsed);
      }
    } catch {
      console.error("Invalid localStorage data");
    }
  }, []);

  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setTooltip("Copied!");
    showToast("Copied to clipboard", "info");
    setTimeout(() => setTooltip(null), 1000);
  };

  const validateCardFields = (fields: Partial<Teacher>) => {
    for (const key in fields) {
      const field = key as keyof Teacher;
      const value = fields[field];
      if (typeof value === "string" && !value.trim()) {
        showToast(`${field} cannot be empty`, "error");
        return false;
      }
      if (field === "email" && typeof value === "string" && !validateEmail(value)) {
        showToast("Invalid email format", "error");
        return false;
      }
      if (field === "phone" && typeof value === "string" && !validatePhone(value)) {
        showToast("Phone must be 10 digits", "error");
        return false;
      }
      if (field === "birthDate" && typeof value === "string" && !validateDate(value)) {
        showToast("Invalid birth date", "error");
        return false;
      }
    }
    return true;
  };

  const validateAndCloseEditCard = (card: string) => {
    if (!data) return;

    if (card === "details") {
      const valid = validateCardFields({
        name: data.name,
        role: data.role,
        birthDate: data.birthDate,
      });
      if (!valid) return;
    } else if (card === "contact") {
      const valid = validateCardFields({
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      if (!valid) return;
    } else if (card === "private" || card === "group") {
      const qualifications = data[`${card}Qualifications` as keyof Teacher] as Qualification[];
      const valid = qualifications.every((q) => q.name.trim() !== "" && q.rate > 0);
      if (!valid) {
        showToast("Please complete or remove invalid qualifications", "error");
        return;
      }
    }

    setActiveEditCard(null);
  };

  const handleSaveCard = (card: string) => {
    if (!data) return;

    if (card === "private" || card === "group") {
      const key = `${card}Qualifications` as keyof Teacher;
      const original = data[key] as Qualification[];
      const filtered = original.filter(q => q.name.trim() !== "" && q.rate > 0);

      if (original.length !== filtered.length) {
        showToast("Please remove or complete empty qualifications", "error");
        return;
      }

      setData(prev => ({ ...prev!, [key]: filtered }));
      localStorage.setItem("teacherDetails", JSON.stringify({ ...data, [key]: filtered }));
      showToast("Qualifications saved", "success");
      setActiveEditCard(null);
      return;
    }

    let valid = true;
    if (card === "details") {
      valid = validateCardFields({ name: data.name, role: data.role, birthDate: data.birthDate });
    } else if (card === "contact") {
      valid = validateCardFields({ email: data.email, phone: data.phone, address: data.address });
    }

    if (!valid) return;
    localStorage.setItem("teacherDetails", JSON.stringify(data));
    showToast("Saved successfully", "success");
    setActiveEditCard(null);
  };

  const handleReset = () => {
    if (!teacher) return;
    setData(teacher);
    localStorage.removeItem("teacherDetails");
    showToast("Reset to default", "error");
    setActiveEditCard(null);
  };

  const addQualification = (type: "private" | "group") => {
    if (!data) return;
    const key = `${type}Qualifications` as keyof Teacher;
    const updated = [...(data[key] as Qualification[]), { name: "", rate: 0 }];
    setData({ ...data, [key]: updated });
  };

  const deleteQualification = (type: "private" | "group", index: number) => {
    if (!data) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this qualification?");
    if (!confirmDelete) return;
    const key = `${type}Qualifications` as keyof Teacher;
    const updated = [...(data[key] as Qualification[])];
    updated.splice(index, 1);
    setData({ ...data, [key]: updated });
    showToast("Qualification deleted", "error");
  };

  const SortableItem = ({ q, i, type }: { q: Qualification; i: number; type: "private" | "group" }) => {
    const key = `${type}Qualifications` as keyof Teacher;
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${type}-${i}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex gap-2 items-center"
        style={style}
        ref={setNodeRef}
        {...attributes}
      >
        <div {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
        <input
          className="border px-2 py-1 rounded text-sm w-1/2"
          placeholder="Name"
          value={q.name}
          onChange={(e) => {
            const name = e.target.value;
            const qualifications = [...(data?.[key] as Qualification[])];
            qualifications[i].name = name;
            setData({ ...data!, [key]: qualifications });
          }}
        />
        <input
          className="border px-2 py-1 rounded text-sm w-1/3"
          type="number"
          min={0}
          placeholder="Rate"
          value={q.rate}
          onChange={(e) => {
            const rate = Number(e.target.value);
            if (rate < 0) return showToast("Rate must be positive", "error");
            const qualifications = [...(data?.[key] as Qualification[])];
            qualifications[i].rate = rate;
            setData({ ...data!, [key]: qualifications });
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            deleteQualification(type, i);
          }}
          className="text-red-500 hover:text-red-700 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </motion.div>
    );
  };

  const renderCard = (
    key: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <div key={key} className="bg-white rounded-xl shadow p-6 w-full relative min-h-[250px]">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {icon} {title}
      </h2>
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 cursor-pointer"
        onClick={() => {
          if (activeEditCard === key) {
            validateAndCloseEditCard(key);
          } else {
            setActiveEditCard(key);
          }
        }}
      >
        <Edit2 size={16} />
      </button>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEditCard === key ? "edit" : "view"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid gap-3"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderQualificationsEditable = (type: "private" | "group") => {
    const key = `${type}Qualifications` as keyof Teacher;
    const items = data?.[key] as Qualification[];

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = parseInt(String(active.id).split("-")[1]);
      const newIndex = parseInt(String(over.id).split("-")[1]);

      const updated = arrayMove(items, oldIndex, newIndex);
      setData({ ...data!, [key]: updated });
    };

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex font-semibold text-sm gap-20 mx-10 mb-2">
          <span className="w-1/2">Name</span>
          <span className="w-1/3">Rate</span>
        </div>
        <SortableContext items={items.map((_, i) => `${type}-${i}`)} strategy={verticalListSortingStrategy}>
          {items.map((q, i) => (
            <SortableItem key={`${type}-${i}`} q={q} i={i} type={type} />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  const renderQualificationsView = (type: "private" | "group") => {
    const items = data?.[`${type}Qualifications` as keyof Teacher] as Qualification[];
    return (
      <>
        <div className="flex font-semibold text-sm gap-20 mx-5 mb-2">
          <span className="w-1/2">Name</span>
          <span className="w-1/3">Rate</span>
        </div>
        {items.length > 0 ? (
          <ul className="grid gap-2">
            {items.map((q, i) => (
              <li key={`${type}-${q.name}-${q.rate}-${i}`} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
                <span className="text-gray-800 w-1/2">{q.name}</span>
                <span className="text-sm text-gray-600 w-1/3">${q.rate}/hr</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No qualifications listed.</p>
        )}
      </>
    );
  };

  if (!data) return <div className="p-4 text-red-500">No teacher data found.</div>;

  return (
    <section className="p-4 space-y-6 relative">
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white
              ${toast.type === "success"
                ? "bg-green-600"
                : toast.type === "info"
                  ? "bg-blue-600"
                  : "bg-red-600"}`}
          >
            {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
            {toast.type === "info" && <Copy className="w-5 h-5" />}
            {toast.type === "error" && <X className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <button onClick={handleReset} className="absolute top-4 right-4 text-sm flex items-center gap-1 text-gray-600 hover:text-red-600">
        <RefreshCcw size={16} /> Reset
      </button>

      {/* Cards Render */}
      <div className="flex flex-col lg:flex-row gap-6">
        {renderCard("details", "Details", <User className="w-5 h-5 text-blue-600" />, activeEditCard === "details" ? (
          <>
            {(["name", "role", "birthDate"] as const).map((field) => (
              <div key={field} className="flex flex-col text-sm">
                <label className="text-gray-600 font-medium mb-1 capitalize">{field}</label>
                <input
                  type={field === "birthDate" ? "date" : "text"}
                  className="border px-3 py-1 rounded-md"
                  value={data?.[field] ?? ""}
                  onChange={(e) => setData({ ...data!, [field]: e.target.value })}
                />
              </div>
            ))}
            <button onClick={() => handleSaveCard("details")} className="text-sm mt-2 bg-blue-600 text-white px-2 py-2 rounded-lg flex justify-center items-center gap-1 cursor-pointer hover:bg-blue-900">
              <Save size={14} /> Save
            </button>
          </>
        ) : (
          <>
            <p><strong>👤 Name:</strong> {data.name}</p>
            <p><strong>🎓 Role:</strong> {data.role}</p>
            <p><strong>📅 Birth Date:</strong> {data.birthDate || "N/A"}</p>
          </>
        ))}
        {renderCard("contact", "Contact", <Mail className="w-5 h-5 text-blue-600" />, activeEditCard === "contact" ? (
          <>
            {(["email", "phone", "address"] as const).map((field) => (
              <div key={field} className="flex flex-col text-sm">
                <label className="text-gray-600 font-medium mb-1 capitalize">{field}</label>
                <input
                  className="border px-3 py-1 rounded-md"
                  value={(data?.[field] as string) ?? ""}
                  onChange={(e) =>
                    setData({ ...data!, [field]: e.target.value })
                  }
                />
              </div>
            ))}
            <button onClick={() => handleSaveCard("contact")} className="text-sm mt-2 bg-blue-600 text-white px-2 py-2 rounded-lg flex justify-center items-center gap-1 cursor-pointer hover:bg-blue-900">
              <Save size={14} /> Save
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 cursor-pointer group relative" onClick={() => handleCopy(data.email)}>
              <Mail size={16} /> {data.email}
              <Copy size={14} className="opacity-50 group-hover:opacity-100" />
              {tooltip && <span className="absolute -top-6 bg-black text-white text-xs px-2 py-1 rounded">{tooltip}</span>}
            </div>
            <div className="flex items-center gap-2 cursor-pointer group relative" onClick={() => handleCopy(data.phone)}>
              <Phone size={16} /> {data.phone}
              <Copy size={14} className="opacity-50 group-hover:opacity-100" />
              {tooltip && <span className="absolute -top-6 bg-black text-white text-xs px-2 py-1 rounded">{tooltip}</span>}
            </div>
            <p><MapPin size={16} className="inline mr-1" /> {data.address}</p>
          </>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {["private", "group"].map((type) =>
          renderCard(
            type,
            type === "private" ? "Private Qualifications" : "Group Qualifications",
            type === "private" ? <GraduationCap className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-blue-600" />,
            activeEditCard === type ? (
              <>
                {renderQualificationsEditable(type as "private" | "group")}
                <button onClick={() => addQualification(type as "private" | "group")} className="flex items-center gap-1 mt-3 text-blue-600">
                  <PlusCircle size={16} /> Add Qualification
                </button>
                <button onClick={() => handleSaveCard(type)} className="text-sm mt-2 bg-blue-600 text-white px-2 py-2 rounded-lg flex justify-center items-center gap-1 cursor-pointer hover:bg-blue-900">
                  <Save size={14} /> Save
                </button>
              </>
            ) : (
              renderQualificationsView(type as "private" | "group")
            )
          )
        )}
      </div>
    </section>
  );
};

export default TeacherDetails;
