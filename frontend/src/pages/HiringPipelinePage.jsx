import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ChevronRight, ChevronLeft, Trash2, Edit2, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterPipeline, updateRecruiterPipelineStage, deleteRecruiterFromPipeline } from '../store/slices/recruiterSlice.js';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-t-indigo-500 bg-indigo-500/5 text-indigo-400' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-t-amber-500 bg-amber-500/5 text-amber-500' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-t-violet bg-violet/5 text-violet' },
  { id: 'offered', label: 'Offered', color: 'border-t-emerald bg-emerald/5 text-emerald' },
  { id: 'rejected', label: 'Rejected', color: 'border-t-rose bg-rose/5 text-rose' }
];

export default function HiringPipelinePage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { pipeline, loading, error } = useSelector((state) => state.recruiter);

  // Notes Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    dispatch(getRecruiterPipeline());
  }, [dispatch]);

  const handleMoveStage = async (studentUserId, targetStage) => {
    try {
      const item = pipeline.find(p => p.userId === studentUserId);
      await dispatch(
        updateRecruiterPipelineStage({
          studentId: studentUserId,
          stage: targetStage,
          notes: item?.notes || '',
        })
      ).unwrap();
      addToast(`Moved candidate to ${targetStage}`, 'success');
      dispatch(getRecruiterPipeline()); // Reload
    } catch (err) {
      addToast(err || 'Failed to update stage', 'error');
    }
  };

  const handleRemoveFromPipeline = async (studentUserId) => {
    try {
      await dispatch(deleteRecruiterFromPipeline(studentUserId)).unwrap();
      addToast('Removed candidate from pipeline', 'success');
    } catch (err) {
      addToast(err || 'Failed to remove candidate', 'error');
    }
  };

  const handleOpenNotesEdit = (item) => {
    setEditingItem(item);
    setNotesText(item.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingItem) return;
    try {
      await dispatch(
        updateRecruiterPipelineStage({
          studentId: editingItem.userId,
          stage: editingItem.stage,
          notes: notesText,
        })
      ).unwrap();
      addToast('Notes updated successfully', 'success');
      setEditingItem(null);
      dispatch(getRecruiterPipeline()); // Reload
    } catch (err) {
      addToast(err || 'Failed to update notes', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('recruiter/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Hiring Pipeline (Kanban)
          </span>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-text">Recruitment Hiring Pipeline</h2>
          <p className="text-xs text-muted font-normal">Track candidates across the interview lifecycle and manage pipeline stages.</p>
        </div>

        {/* Pipeline board */}
        {loading && pipeline.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted font-mono">Syncing pipeline columns...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageItems = pipeline.filter((item) => item.stage === stage.id);

              return (
                <div
                  key={stage.id}
                  className={`w-72 md:w-auto border-t-4 ${stage.color} border border-border bg-[#05070d]/55 backdrop-blur-md p-4 rounded-xl space-y-4 flex flex-col min-h-[500px] shadow-lg`}
                >
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text">{stage.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted font-bold font-mono">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {stageItems.length === 0 ? (
                      <div className="text-center py-12 text-[10px] text-muted italic border border-dashed border-border/60 rounded-lg">
                        Empty column
                      </div>
                    ) : (
                      stageItems.map((item) => (
                        <div
                          key={item.userId}
                          className="p-3.5 border border-border bg-void/50 rounded-xl hover:border-accent/40 hover:shadow-lg transition-all space-y-3 relative group"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">
                              Grade: {item.internshipProgress}%
                            </span>
                            <h4 className="text-xs font-bold text-text group-hover:text-accent transition-colors">
                              {item.fullName}
                            </h4>
                            <p className="text-[9px] text-muted truncate">
                              {item.careerTrack}
                            </p>
                            <p className="text-[8px] text-muted/80 truncate">
                              {item.collegeName}
                            </p>
                          </div>

                          {item.notes && (
                            <div className="text-[9px] bg-white/5 border border-border/40 p-2 rounded text-muted italic leading-relaxed break-words">
                              {item.notes}
                            </div>
                          )}

                          {/* Action controls */}
                          <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleOpenNotesEdit(item)}
                                className="text-muted hover:text-text p-1 hover:bg-white/5 rounded transition-colors"
                                title="Edit pipeline notes"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => handleRemoveFromPipeline(item.userId)}
                                className="text-muted hover:text-rose p-1 hover:bg-white/5 rounded transition-colors"
                                title="Remove from pipeline"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <select
                                value={item.stage}
                                onChange={(e) => handleMoveStage(item.userId, e.target.value)}
                                className="bg-[#05070d] border border-border text-[9px] px-1.5 py-0.5 rounded text-muted outline-none focus:border-accent max-w-[80px]"
                              >
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interviewing">Interview</option>
                                <option value="offered">Offer</option>
                                <option value="rejected">Reject</option>
                              </select>
                              
                              <button
                                onClick={() => navigate(`recruiter/students/${item.userId}`)}
                                className="p-1 hover:bg-white/5 text-accent hover:text-accent-bright rounded transition-colors"
                                title="Audit Scorecard"
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Notes Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass border border-border p-5 rounded-xl bg-void/65 shadow-2xl relative z-10 space-y-4"
          >
            <div className="border-b border-border pb-2.5">
              <h3 className="font-display font-bold text-sm">Edit Stage Notes</h3>
              <p className="text-[10px] text-muted">Update recruitment comments for {editingItem.fullName}</p>
            </div>

            <div className="space-y-1">
              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="E.g. Passed initial HR call, scheduling technical audit review."
                className="w-full bg-[#0a0f1d] border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3.5 py-1.5 border border-border text-xs rounded-lg hover:bg-white/5 text-muted hover:text-text font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
