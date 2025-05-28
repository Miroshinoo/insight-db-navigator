
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Database, Globe, Users, Activity, TrendingUp, Server } from "lucide-react";

interface AnalyticsData {
  tableStats: { name: string; rowCount: number; size: string; type: 'iis' | 'sql' }[];
  connectionStats: { time: string; connections: number }[];
  userActivity: { user: string; actions: number; lastActive: string }[];
  systemHealth: { cpu: number; memory: number; disk: number };
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Mock analytics data - in real app, this would come from your API
    const mockData: AnalyticsData = {
      tableStats: [
        { name: 'vp-v10-applications', rowCount: 1250, size: '2.1 MB', type: 'iis' },
        { name: 'vp-v11-sites', rowCount: 890, size: '1.8 MB', type: 'iis' },
        { name: 'vp-sql-databases', rowCount: 340, size: '890 KB', type: 'sql' },
        { name: 'vp-sql-logs', rowCount: 15600, size: '12.4 MB', type: 'sql' },
        { name: 'vp-v9-legacy', rowCount: 450, size: '1.2 MB', type: 'iis' },
      ],
      connectionStats: [
        { time: '00:00', connections: 12 },
        { time: '04:00', connections: 8 },
        { time: '08:00', connections: 25 },
        { time: '12:00', connections: 38 },
        { time: '16:00', connections: 42 },
        { time: '20:00', connections: 28 },
      ],
      userActivity: [
        { user: 'admin@example.com', actions: 156, lastActive: '2 minutes ago' },
        { user: 'editor@example.com', actions: 89, lastActive: '15 minutes ago' },
        { user: 'viewer@example.com', actions: 23, lastActive: '1 hour ago' },
      ],
      systemHealth: { cpu: 35, memory: 68, disk: 42 }
    };
    
    setAnalyticsData(mockData);
  }, []);

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const totalIISRows = analyticsData.tableStats
    .filter(t => t.type === 'iis')
    .reduce((sum, t) => sum + t.rowCount, 0);
    
  const totalSQLRows = analyticsData.tableStats
    .filter(t => t.type === 'sql')
    .reduce((sum, t) => sum + t.rowCount, 0);

  const pieData = [
    { name: 'IIS Applications', value: totalIISRows, color: '#3b82f6' },
    { name: 'SQL Databases', value: totalSQLRows, color: '#10b981' }
  ];

  const getHealthColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (value: number) => {
    if (value < 50) return 'bg-green-100';
    if (value < 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIISRows + totalSQLRows}</div>
            <p className="text-xs text-muted-foreground">Across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IIS Applications</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIISRows}</div>
            <p className="text-xs text-muted-foreground">Active applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SQL Databases</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSQLRows}</div>
            <p className="text-xs text-muted-foreground">Database records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userActivity.length}</div>
            <p className="text-xs text-muted-foreground">Currently connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Connection Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.connectionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="connections" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.tableStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rowCount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className={`text-sm font-bold ${getHealthColor(analyticsData.systemHealth.cpu)}`}>
                  {analyticsData.systemHealth.cpu}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getHealthBgColor(analyticsData.systemHealth.cpu)} opacity-80`}
                  style={{ width: `${analyticsData.systemHealth.cpu}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className={`text-sm font-bold ${getHealthColor(analyticsData.systemHealth.memory)}`}>
                  {analyticsData.systemHealth.memory}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getHealthBgColor(analyticsData.systemHealth.memory)} opacity-80`}
                  style={{ width: `${analyticsData.systemHealth.memory}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className={`text-sm font-bold ${getHealthColor(analyticsData.systemHealth.disk)}`}>
                  {analyticsData.systemHealth.disk}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getHealthBgColor(analyticsData.systemHealth.disk)} opacity-80`}
                  style={{ width: `${analyticsData.systemHealth.disk}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.userActivity.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.user}</p>
                    <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {user.actions} actions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
