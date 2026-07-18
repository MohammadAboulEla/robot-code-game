/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, CheckCircle2, Lock, BookOpen } from 'lucide-react';
import { TREE_NODES, TreeNode } from '../progression/tree';

interface ResearchTreeProps {
  unlockedNodeIds: string[];
  onClose: () => void;
}

export const ResearchTree: React.FC<ResearchTreeProps> = ({
  unlockedNodeIds,
  onClose
}) => {
  const isUnlocked = (nodeId: string) => unlockedNodeIds.includes(nodeId);

  // Helper to find a node title by ID (for prerequisite displays)
  const getNodeTitle = (nodeId: string) => {
    const found = TREE_NODES.find(n => n.id === nodeId);
    return found ? found.title : nodeId;
  };

  // Simple custom Markdown formatter for node docs
  const renderNodeDoc = (doc: string) => {
    const paragraphs = doc.split('\n\n');
    return (
      <div className="space-y-2.5 mt-2.5 text-xs leading-relaxed text-[#5c5341]">
        {paragraphs.map((p, idx) => {
          if (p.startsWith('## ')) {
            return (
              <h4 key={idx} className="font-bold font-serif text-sm uppercase text-[#9c3526] mt-4">
                {p.replace('## ', '')}
              </h4>
            );
          }
          if (p.startsWith('```')) {
            const code = p.replace(/```python\n|```/g, '');
            return (
              <pre key={idx} className="bg-[#eae3ce]/50 p-3 font-mono text-[11px] text-[#9c3526] border border-[#3e382d]/10 overflow-x-auto my-2 rounded-none">
                {code}
              </pre>
            );
          }
          return <p key={idx}>{p}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2e2a22] tracking-tight font-serif uppercase">
              Research & Progression Tree
            </h2>
            <p className="text-xs text-[#5c5341] mt-0.5">
              Solve training modules to unlock language features and commands.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#3e382d] bg-[#f4efe1] hover:bg-[#faf8f2] hover:text-[#9c3526] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Missions
        </button>
      </div>

      {/* Nodes list */}
      <div className="space-y-4">
        {TREE_NODES.map((node) => {
          const unlocked = isUnlocked(node.id);
          const hasPrereqs = node.prerequisiteNodeIds.length > 0;
          const allPrereqsMet = node.prerequisiteNodeIds.every(id => isUnlocked(id));

          return (
            <div
              key={node.id}
              className={`border transition-all duration-200 p-5 md:p-6 bg-[#f4efe1] ${
                unlocked
                  ? 'border-[#81a364]/60 shadow-sm'
                  : 'border-[#3e382d]/20 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className={`
                  flex-shrink-0 w-10 h-10 flex items-center justify-center border text-sm font-bold font-mono
                  ${unlocked
                    ? 'bg-[#e2ebd5] border-[#81a364] text-[#4a6b2a]'
                    : 'bg-[#eae3ce] border-[#3e382d]/20 text-[#8a7e6b]'
                  }
                `}>
                  {unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4a6b2a]" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#8a7e6b]" />
                  )}
                </div>

                {/* Node details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold tracking-tight font-serif uppercase ${
                      unlocked ? 'text-[#2e2a22]' : 'text-[#8a7e6b]'
                    }`}>
                      {node.title}
                    </h3>
                    {unlocked ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#e2ebd5] text-[#4a6b2a] border border-[#81a364]/40 tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#eae3ce] text-[#8a7e6b] border border-[#3e382d]/10 tracking-wider">
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Prerequisites info */}
                  {hasPrereqs && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                      <span className="text-[#8a7e6b]">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1">
                        {node.prerequisiteNodeIds.map(prereqId => {
                          const prereqMet = isUnlocked(prereqId);
                          return (
                            <span
                              key={prereqId}
                              className={`px-1 py-0.2 border text-[9px] ${
                                prereqMet
                                  ? 'bg-[#e2ebd5]/50 border-[#81a364]/30 text-[#4a6b2a]'
                                  : 'bg-[#eae3ce]/50 border-[#3e382d]/10 text-[#8a7e6b]'
                              }`}
                            >
                              {getNodeTitle(prereqId)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Command unlocks */}
                  {node.unlocksCommandIds.length > 0 && (
                    <div className="mt-2 text-[10px] font-mono flex flex-wrap items-center gap-1.5">
                      <span className="text-[#8a7e6b]">Unlocks:</span>
                      {node.unlocksCommandIds.map(cmd => (
                        <code key={cmd} className={`px-1 py-0.5 font-bold border ${
                          unlocked
                            ? 'bg-[#9c3526]/5 border-[#9c3526]/20 text-[#9c3526]'
                            : 'bg-transparent border-[#3e382d]/10 text-[#8a7e6b]'
                        }`}>
                          {cmd}()
                        </code>
                      ))}
                    </div>
                  )}

                  {/* Documentation */}
                  {unlocked ? (
                    <div className="mt-4 border-t border-[#eae3ce] pt-3.5">
                      {renderNodeDoc(node.docMarkdown)}
                    </div>
                  ) : (
                    <p className="text-xs italic text-[#8a7e6b] mt-3 font-serif">
                      {!allPrereqsMet 
                        ? 'Unlock prerequisites to view training documentation.'
                        : `Complete preceding training modules to unlock.`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
