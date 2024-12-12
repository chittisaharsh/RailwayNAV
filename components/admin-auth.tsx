import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminAuthProps {
  nodes: Record<string, string>;
  onLogin: (enabledNodes: string[]) => void;
  onCancel: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ nodes, onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(!nodes);
  const [enabledNodes, setEnabledNodes] = useState<string[]>([]);

  useEffect(() => {
    if (nodes) {
      setEnabledNodes(Object.keys(nodes));
      setIsLoading(false);
    }
  }, [nodes]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleNodeToggle = (nodeId: string) => {
    setEnabledNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleApplyChanges = () => {
    onLogin(enabledNodes);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={true} onOpenChange={() => onCancel()}>
        <DialogContent>
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-2"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-2"
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Login</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Node Management</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(nodes).map(([nodeId, nodeName]) => (
            <div key={nodeId} className="flex items-center space-x-2">
              <Checkbox
                id={nodeId}
                checked={enabledNodes.includes(nodeId)}
                onCheckedChange={() => handleNodeToggle(nodeId)}
              />
              <label htmlFor={nodeId}>{nodeName}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleApplyChanges}>Apply Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAuth;

