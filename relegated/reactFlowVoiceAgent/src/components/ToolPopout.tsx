import { useCallback, useState } from "react";

import type { MCPTool } from "../lib/clientTypes.ts";
import { useGemini } from "../ai/llmContext.tsx";

interface ToolPopoutProps {
  setViewToolPopout: (open: boolean) => void;
}

interface ToolDropdownProps {
  tool: MCPTool;
  onClose: () => void;
  callToolManual: (call: any) => Promise<any>;
}



const ToolDropdown: React.FC<ToolDropdownProps> = ({ tool, onClose, callToolManual }) => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [output, setOutput] = useState("");

  const setNestedValue = useCallback((obj: any, path: string[], value: any): any => {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: setNestedValue(obj?.[head] ?? {}, rest, value),
    };
  }, []);

  const handleChange = useCallback((path: string[], value: any) => {
    setParams((prev) => setNestedValue(prev, path, value));
  }, [setNestedValue]);

  const getNestedValue = useCallback((obj: any, path: string[]) => {
    return path.reduce((acc, k) => (acc ? acc[k] : ""), obj) ?? "";
  }, []);

  const renderInput = useCallback((prop: any, path: string[]): React.ReactNode => {
    const inputTypes = ["string", "number", "boolean"];
    
    if (inputTypes.includes(prop.type)) {
      const currentValue = getNestedValue(params, path);
      
      return (
        <div key={path.join(".")} className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300 tracking-wide">
            {path.join(".")}
          </label>
          <input
            type={prop.type}
            placeholder={prop.description || ""}
            value={String(currentValue)}
            onChange={(e) => {
              const rawValue = e.target.value;
              let value: string | number | boolean = rawValue;

              if (prop.type === "number") {
                value = rawValue === "" ? "" : Number(rawValue);
              } else if (prop.type === "boolean") {
                value = rawValue === "true";
              }

              handleChange(path, value);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
          />
        </div>
      );
    }

    if (prop.type === "object" && prop.properties) {
      return (
        <div key={path.join(".")} className="space-y-2 pl-2 border-l border-slate-600">
          <label className="block text-xs font-semibold text-slate-400">
            {path.join(".")}
          </label>
          {Object.entries(prop.properties).map(([subKey, subProp]) =>
            renderInput(subProp, [...path, subKey])
          )}
        </div>
      );
    }

    return null;
  }, [params, handleChange, getNestedValue]);

  const handleSubmit = useCallback(async () => {
    console.log(params);
    const call = { id: "random", name: tool.name, args: params };
    
    try {
      const result = await callToolManual(call);
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  }, [params, tool.name, callToolManual]);

  const parameterEntries = tool.parameters?.properties 
    ? Object.entries(tool.parameters.properties) 
    : [];

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-600 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-600 flex items-center justify-between bg-slate-900">
        <h3 className="text-base font-semibold text-white">{tool.name}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors text-lg"
          aria-label="Close tool"
        >
          ✕
        </button>
      </div>

      {/* Parameters */}
      <div className="p-4 space-y-4">
        {parameterEntries.map(([key, prop]) => renderInput(prop, [key]))}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Run
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="p-4 bg-slate-900 border-t border-slate-600">
        <h4 className="text-sm font-semibold text-emerald-400 mb-2">Tool Output</h4>
        <pre className="text-slate-300 text-xs whitespace-pre-wrap break-words">
          {output}
        </pre>
      </div>
    </div>
  );
};

const ToolList: React.FC<{ tools: MCPTool[]; onToolSelect: (toolName: string) => void }> = ({ 
  tools, 
  onToolSelect 
}) => {
  if (tools.length === 0) {
    return (
      <div className="text-slate-400 text-sm italic">No tools available</div>
    );
  }

  return (
    <div className="space-y-2">
      {tools.map((tool) => (
        <button
          key={tool.name}
          className="w-full bg-slate-700 rounded-lg p-3 border border-slate-600 text-left hover:bg-slate-600 transition-colors"
          onClick={() => onToolSelect(tool.name)}
        >
          <div className="text-emerald-200 font-mono text-sm font-semibold mb-1">
            {tool.name}
          </div>
          {tool.description && (
            <div className="text-slate-300 text-xs">
              {tool.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};




export const ToolPopout: React.FC<ToolPopoutProps> = ({ setViewToolPopout }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { tools, callToolManual } = useGemini();

  const handleClosePopout = useCallback(() => {
    setViewToolPopout(false);
  }, [setViewToolPopout]);

  const handleToolSelect = useCallback((toolName: string) => {
    setActiveTool(toolName);
  }, []);

  const handleCloseToolDropdown = useCallback(() => {
    setActiveTool(null);
  }, []);

  const selectedTool = tools.find((t) => t.name === activeTool);

  return (
    <div className="w-120 h-screen bg-slate-800 border-r border-slate-600 flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-emerald-300">🔧 Tool Management</h3>
        <button
          onClick={handleClosePopout}
          className="text-slate-400 hover:text-white transition-colors text-lg p-1"
          aria-label="Close tool management"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-emerald-400 mb-2">
            Available Tools ({tools.length})
          </h4>
          
          <ToolList tools={tools} onToolSelect={handleToolSelect} />
          
          {activeTool && selectedTool && (
            <div className="mt-4">
              <ToolDropdown
                tool={selectedTool}
                onClose={handleCloseToolDropdown}
                callToolManual={callToolManual}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};