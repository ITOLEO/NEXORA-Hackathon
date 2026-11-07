import React, { useState } from 'react';
import {
  Network,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { GraphNode, GraphEdge, GraphNodeType, GraphEdgeRelationship } from '../../types/nexora';

export const LecturerKnowledgeGraph: React.FC = () => {
  const { graphNodes, graphEdges, addGraphNode, editGraphNode, addGraphEdge, removeGraphEdge } = useNexora();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_cs402');
  const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  // New node state
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<GraphNodeType>('MicroSkill');
  const [nodeCode, setNodeCode] = useState('');
  const [nodeDesc, setNodeDesc] = useState('');

  // Connect edge state
  const [sourceNodeId, setSourceNodeId] = useState<string>('node_mlf');
  const [targetNodeId, setTargetNodeId] = useState<string>('node_pds');
  const [relationshipType, setRelationshipType] = useState<GraphEdgeRelationship>('REQUIRES');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedNode = graphNodes.find(n => n.id === selectedNodeId);

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeLabel.trim()) return;
    addGraphNode({
      label: nodeLabel,
      type: nodeType,
      code: nodeCode,
      description: nodeDesc,
      x: 150 + Math.random() * 250,
      y: 100 + Math.random() * 250,
    });
    setIsAddNodeOpen(false);
    setNodeLabel('');
    setNodeCode('');
    setNodeDesc('');
  };

  const handleConnectEdges = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = addGraphEdge(sourceNodeId, targetNodeId, relationshipType);
    if (!result.success) {
      setErrorMessage(result.message || 'Invalid relationship');
    } else {
      setIsConnectOpen(false);
      setSuccessMessage(`Directed relationship '${relationshipType}' created successfully.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const getNodeColor = (type: GraphNodeType) => {
    switch (type) {
      case 'Course':
        return 'bg-[#173A32] text-white border-[#173A32]';
      case 'Outcome':
        return 'bg-[#25866A] text-white border-[#25866A]';
      case 'Competency':
        return 'bg-[#D7A85B] text-[#173A32] border-[#D7A85B] font-bold';
      case 'MicroSkill':
        return 'bg-[#F4F2EA] text-[#173A32] border-[#25866A] font-semibold';
      case 'Assessment':
        return 'bg-[#A76716] text-white border-[#A76716]';
      case 'Resource':
        return 'bg-[#416B8B] text-white border-[#416B8B]';
      default:
        return 'bg-[#F4F2EA] text-[#173A32] border-[#DCE4DD]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-2xl text-[#173A32]">Course Knowledge Graph</h1>
          <p className="text-xs text-[#66736C] max-w-2xl">
            Interactive directed competency graph and accessible structured table linking course modules, learning outcomes, micro-skills, learning resources, and assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#F4F2EA] p-1 border border-[#DCE4DD]">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'canvas' ? 'bg-[#173A32] text-white' : 'text-[#66736C] hover:text-[#173A32]'
              }`}
            >
              Interactive Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#173A32] text-white' : 'text-[#66736C] hover:text-[#173A32]'
              }`}
            >
              Accessible Table View
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddNodeOpen(true)}
            className="px-3.5 py-2.5 bg-[#173A32] hover:bg-[#25866A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D7A85B]" />
            <span>Add Graph Node</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConnectOpen(true)}
            className="px-3.5 py-2.5 bg-[#25866A] hover:bg-[#173A32] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Network className="w-4 h-4" />
            <span>Connect Directed Nodes</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#237A55]/10 border border-[#237A55]/30 text-[#237A55] rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Canvas + Sidebar split (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Visual Canvas OR Accessible Structured Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DCE4DD]">
            <span className="text-xs font-bold text-[#173A32]">
              {viewMode === 'canvas'
                ? 'Directed Knowledge Graph Viewport'
                : `Accessible Structured Node & Edge Table (${graphNodes.length} Nodes, ${graphEdges.length} Edges)`}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-[#66736C]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#173A32]" /> Course</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#25866A]" /> Outcome</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D7A85B]" /> Competency</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#416B8B]" /> Resource</span>
            </div>
          </div>

          {viewMode === 'canvas' ? (
            /* Canvas SVG Area */
            <div className="h-[480px] w-full bg-[#F4F2EA]/40 border border-[#DCE4DD] rounded-xl relative overflow-hidden p-6 select-none">
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#25866A" />
                  </marker>
                </defs>
                {graphEdges.map(edge => {
                  const srcNode = graphNodes.find(n => n.id === edge.source);
                  const tgtNode = graphNodes.find(n => n.id === edge.target);
                  if (!srcNode || !tgtNode) return null;
                  return (
                    <g key={edge.id}>
                      <line
                        x1={srcNode.x + 60}
                        y1={srcNode.y + 20}
                        x2={tgtNode.x + 60}
                        y2={tgtNode.y + 20}
                        stroke="#25866A"
                        strokeWidth="2"
                        strokeDasharray={edge.relationship === 'REQUIRES' ? '4 4' : undefined}
                        markerEnd="url(#arrow)"
                      />
                      <text
                        x={(srcNode.x + tgtNode.x) / 2 + 60}
                        y={(srcNode.y + tgtNode.y) / 2 + 15}
                        fill="#173A32"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bg-white px-1"
                      >
                        {edge.relationship}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Render Nodes */}
              {graphNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    className={`absolute text-left px-3 py-2 rounded-xl border shadow-xs cursor-pointer transition-all duration-150 text-xs ${getNodeColor(
                      node.type
                    )} ${isSelected ? 'ring-2 ring-[#25866A] scale-105 shadow-md' : 'hover:scale-102'}`}
                  >
                    <span className="text-[9px] uppercase tracking-wider block opacity-75 font-mono">{node.type}</span>
                    <span className="font-bold block leading-tight">{node.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Accessible Structured Table View (PRD 08 Section 10.D & Section 18) */
            <div className="overflow-x-auto border border-[#DCE4DD] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F2EA] text-[#173A32] border-b border-[#DCE4DD]">
                    <th className="py-2.5 px-3 font-bold">Node Type</th>
                    <th className="py-2.5 px-3 font-bold">Code</th>
                    <th className="py-2.5 px-3 font-bold">Label</th>
                    <th className="py-2.5 px-3 font-bold">Outgoing & Incoming Relationships</th>
                    <th className="py-2.5 px-3 font-bold text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4DD]">
                  {graphNodes.map(node => {
                    const nodeEdges = graphEdges.filter(
                      e => e.source === node.id || e.target === node.id
                    );
                    return (
                      <tr
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedNodeId === node.id ? 'bg-[#25866A]/10' : 'hover:bg-[#F4F2EA]/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#25866A]">{node.type}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#66736C]">
                          {node.code || node.id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#173A32]">{node.label}</td>
                        <td className="py-2.5 px-3 text-[11px] text-[#66736C]">
                          {nodeEdges.length} connected edges
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedNodeId(node.id)}
                            className="px-2.5 py-1 bg-[#173A32] text-white rounded-lg text-[11px] font-semibold"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Node Details & Connected Edges Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE4DD] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-[#173A32] pb-3 border-b border-[#DCE4DD]">
            Node Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#25866A] uppercase">{selectedNode.type}</span>
                <h4 className="font-heading font-extrabold text-lg text-[#173A32]">{selectedNode.label}</h4>
                {selectedNode.code && <p className="text-[11px] font-mono text-[#66736C]">ID: {selectedNode.code}</p>}
              </div>

              {selectedNode.description && (
                <div className="p-3 bg-[#F4F2EA] rounded-xl border border-[#DCE4DD] text-[#173A32]">
                  <p className="leading-relaxed">{selectedNode.description}</p>
                </div>
              )}

              {/* Connected Relationships */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-[#173A32] block">Active Directed Edges</span>
                <div className="space-y-1.5">
                  {graphEdges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map(e => {
                      const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                      const otherNode = graphNodes.find(n => n.id === otherNodeId);
                      return (
                        <div
                          key={e.id}
                          className="p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl flex items-center justify-between text-[11px]"
                        >
                          <span className="font-semibold text-[#173A32]">
                            {e.source === selectedNode.id ? `→ ${e.relationship} →` : `← ${e.relationship} ←`}{' '}
                            {otherNode?.label}
                          </span>
                          <button
                            onClick={() => removeGraphEdge(e.id)}
                            className="p-1 text-[#B54747] hover:bg-[#B54747]/10 rounded-md"
                            title="Remove edge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#66736C] italic">Select a node on the canvas to inspect details and edges.</p>
          )}
        </div>
      </div>

      {/* Add Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Add Graph Node</h3>
              <button onClick={() => setIsAddNodeOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Node Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scikit-Learn Preprocessing"
                  value={nodeLabel}
                  onChange={e => setNodeLabel(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Node Type</label>
                <select
                  value={nodeType}
                  onChange={e => setNodeType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                >
                  <option value="Course">Course</option>
                  <option value="Outcome">Learning Outcome</option>
                  <option value="Competency">Competency Cluster</option>
                  <option value="MicroSkill">Micro-Skill</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Resource">Resource</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Node Code / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. SK-MLF"
                  value={nodeCode}
                  onChange={e => setNodeCode(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button type="button" onClick={() => setIsAddNodeOpen(false)} className="px-4 py-2 text-[#66736C]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#173A32] text-white font-semibold rounded-xl">
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Directed Nodes Modal */}
      {isConnectOpen && (
        <div className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DD] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-3">
              <h3 className="font-heading font-bold text-base text-[#173A32]">Connect Directed Nodes</h3>
              <button onClick={() => setIsConnectOpen(false)} className="text-[#66736C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#B54747]/10 border border-[#B54747]/30 text-[#B54747] rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConnectEdges} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Source Node (From)</label>
                <select
                  value={sourceNodeId}
                  onChange={e => setSourceNodeId(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                >
                  {graphNodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.type}] {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Relationship Type</label>
                <select
                  value={relationshipType}
                  onChange={e => setRelationshipType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl font-bold"
                >
                  <option value="CONTAINS">CONTAINS</option>
                  <option value="SUPPORTS">SUPPORTS</option>
                  <option value="REQUIRES">REQUIRES (Prerequisite)</option>
                  <option value="EXPLAINS">EXPLAINS</option>
                  <option value="ASSESSES">ASSESSES</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Target Node (To)</label>
                <select
                  value={targetNodeId}
                  onChange={e => setTargetNodeId(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F2EA]/60 border border-[#DCE4DD] rounded-xl"
                >
                  {graphNodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.type}] {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DD]">
                <button type="button" onClick={() => setIsConnectOpen(false)} className="px-4 py-2 text-[#66736C]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#25866A] text-white font-semibold rounded-xl">
                  Connect & Validate Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
