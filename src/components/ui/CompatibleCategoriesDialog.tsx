'use client';

import { Fragment } from 'react';
import { X } from 'lucide-react';
import { CategoryTemplate } from '@/services/category-templates';

interface CompatibleCategoriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: CategoryTemplate;
  allTemplates: CategoryTemplate[];
}

export function CompatibleCategoriesDialog({
  isOpen,
  onClose,
  selectedTemplate,
  allTemplates,
}: CompatibleCategoriesDialogProps) {
  if (!isOpen) return null;

  // Get compatible templates - now they come populated from the backend
  const compatibleTemplates = (selectedTemplate.compatibleTemplates || []) as Array<{
    _id: string;
    name: string;
    level: string;
  }>;

  // Build network connections - find which compatible templates are also compatible with each other
  const connections = new Map<string, Set<string>>();

  // Add connections from selected template to all compatible
  compatibleTemplates.forEach((template) => {
    if (!connections.has(selectedTemplate._id)) {
      connections.set(selectedTemplate._id, new Set());
    }
    connections.get(selectedTemplate._id)!.add(template._id);
  });

  // Add connections between compatible templates by checking if they also exist in allTemplates
  compatibleTemplates.forEach((template) => {
    const fullTemplate = allTemplates.find((t) => t._id === template._id);
    if (!fullTemplate) return;

    const templateCompatibles = (fullTemplate.compatibleTemplates || []).map((t) =>
      typeof t === 'string' ? t : t._id
    );

    compatibleTemplates.forEach((otherTemplate) => {
      if (template._id !== otherTemplate._id && templateCompatibles.includes(otherTemplate._id)) {
        if (!connections.has(template._id)) {
          connections.set(template._id, new Set());
        }
        connections.get(template._id)!.add(otherTemplate._id);
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-950/80 transition-opacity" onClick={onClose} />

        {/* Dialog */}
        <div className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 ring-1 ring-white/10">
          {/* Header */}
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-xl font-semibold text-white mb-2">
                Categorias Compatíveis
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Visualização de categorias que podem jogar juntas com <span className="font-semibold text-indigo-400">{selectedTemplate.name}</span>
              </p>

              {/* Network Visualization */}
              <div className="bg-gray-950 rounded-lg p-8 mb-6 border border-white/10 overflow-x-auto">
                {compatibleTemplates.length > 0 ? (
                  <div className="relative min-h-[500px] flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      {/* Draw connection lines */}
                      {compatibleTemplates.map((template, index) => {
                        const angle = (index / compatibleTemplates.length) * 2 * Math.PI - Math.PI / 2;
                        const radius = 180;
                        const x2 = 50 + Math.cos(angle) * radius / 4;
                        const y2 = 50 + Math.sin(angle) * radius / 4;

                        return (
                          <line
                            key={`line-${template._id}`}
                            x1="50%"
                            y1="50%"
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="2"
                            strokeOpacity="0.3"
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {/* Draw inter-connections between compatible templates */}
                      {compatibleTemplates.map((template, index) => {
                        const fullTemplate = allTemplates.find((t) => t._id === template._id);
                        if (!fullTemplate) return null;

                        const templateCompatibles = (fullTemplate.compatibleTemplates || []).map((t) =>
                          typeof t === 'string' ? t : t._id
                        );

                        return compatibleTemplates.map((otherTemplate, otherIndex) => {
                          if (index >= otherIndex || !templateCompatibles.includes(otherTemplate._id)) return null;

                          const angle1 = (index / compatibleTemplates.length) * 2 * Math.PI - Math.PI / 2;
                          const angle2 = (otherIndex / compatibleTemplates.length) * 2 * Math.PI - Math.PI / 2;
                          const radius = 180;

                          const x1 = 50 + Math.cos(angle1) * radius / 4;
                          const y1 = 50 + Math.sin(angle1) * radius / 4;
                          const x2 = 50 + Math.cos(angle2) * radius / 4;
                          const y2 = 50 + Math.sin(angle2) * radius / 4;

                          return (
                            <line
                              key={`inter-${template._id}-${otherTemplate._id}`}
                              x1={`${x1}%`}
                              y1={`${y1}%`}
                              x2={`${x2}%`}
                              y2={`${y2}%`}
                              stroke="rgb(168, 85, 247)"
                              strokeWidth="1.5"
                              strokeOpacity="0.2"
                            />
                          );
                        });
                      })}
                    </svg>

                    {/* Center Node - Selected Template */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/40 hover:scale-110 transition-transform cursor-pointer">
                        <div className="text-center px-3">
                          <p className="text-white font-bold text-xs leading-tight">{selectedTemplate.name}</p>
                          <p className="text-indigo-100 text-[10px] mt-1">{selectedTemplate.level}</p>
                        </div>
                      </div>
                    </div>

                    {/* Surrounding Nodes - Compatible Templates */}
                    {compatibleTemplates.map((template, index) => {
                      const angle = (index / compatibleTemplates.length) * 2 * Math.PI - Math.PI / 2;
                      const radius = 180;
                      const x = 50 + Math.cos(angle) * radius / 4;
                      const y = 50 + Math.sin(angle) * radius / 4;

                      const hasConnections = connections.has(template._id) && connections.get(template._id)!.size > 1;

                      return (
                        <div
                          key={template._id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            zIndex: 5,
                          }}
                        >
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl ring-2 hover:scale-110 transition-all cursor-pointer ${
                            hasConnections
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 ring-purple-400/40 shadow-purple-500/40'
                              : 'bg-gradient-to-br from-gray-700 to-gray-800 ring-gray-600/40 shadow-gray-700/30'
                          }`}>
                            <div className="text-center px-2">
                              <p className="text-white font-semibold text-[10px] leading-tight">{template.name}</p>
                              <p className="text-gray-200 text-[9px] mt-0.5">{template.level}</p>
                            </div>
                          </div>

                          {hasConnections && (
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-[10px] text-purple-400 bg-gray-900/80 px-2 py-0.5 rounded-full">
                                +{connections.get(template._id)!.size - 1}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">Nenhuma categoria compatível encontrada</p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600" />
                  <span className="text-gray-300">Categoria Selecionada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600" />
                  <span className="text-gray-300">Com múltiplas conexões</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
                  <span className="text-gray-300">Conexão simples</span>
                </div>
              </div>

              {/* Detailed List */}
              {compatibleTemplates.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Lista Detalhada</h4>
                  <div className="bg-gray-950 rounded-lg border border-white/10 overflow-hidden">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Nível
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Conexões
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {compatibleTemplates.map((template) => {
                          const connectionCount = connections.get(template._id)?.size || 1;
                          return (
                            <tr key={template._id} className="hover:bg-white/5">
                              <td className="px-4 py-3 text-sm text-white font-medium">
                                {template.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400">
                                {template.level}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400">
                                {connectionCount > 1 ? (
                                  <span className="text-purple-400">+{connectionCount - 1} outras</span>
                                ) : (
                                  <span className="text-gray-500">Conexão simples</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
