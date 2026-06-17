"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { searchCourses } from "@/data/coursesData";
import type { Course } from "@/data/coursesData";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchCourses(query).slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = focused && query.length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Busca por nombre, área o palabra clave..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/30 bg-white/95 backdrop-blur text-brand-dark placeholder:text-brand-gray shadow-xl focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all text-base"
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Buscador Inteligente
          </span>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
          {results.length > 0 ? (
            <ul>
              {results.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/curso/${course.slug}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-brand-50 transition-colors group"
                    onClick={() => {
                      setQuery("");
                      setFocused(false);
                    }}
                  >
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-brand-700 text-sm">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{course.date}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-slate-500">
              No se encontraron cursos para &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
