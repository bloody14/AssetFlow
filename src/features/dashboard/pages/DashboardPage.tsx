import { WidgetContainer } from '../components/WidgetContainer';
import { Package, ShoppingCart, MonitorSmartphone, AlertTriangle } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of your AssetFlow ERP system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WidgetContainer title="Total Assets" icon={MonitorSmartphone}>
          <div className="text-2xl font-bold">1,248</div>
          <p className="text-xs text-muted-foreground">+24 from last month</p>
        </WidgetContainer>

        <WidgetContainer title="Low Stock Items" icon={Package}>
          <div className="text-2xl font-bold text-destructive">12</div>
          <p className="text-xs text-muted-foreground">Require immediate restocking</p>
        </WidgetContainer>

        <WidgetContainer title="Pending POs" icon={ShoppingCart}>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </WidgetContainer>

        <WidgetContainer title="Active Alerts" icon={AlertTriangle}>
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <p className="text-xs text-muted-foreground">System notifications</p>
        </WidgetContainer>
      </div>

      {/* Future dynamic widgets will map through dashboardWidgets here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <WidgetContainer 
          title="Recent Activity" 
          className="lg:col-span-4"
          isLoading={false}
        >
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Activity Chart Placeholder
          </div>
        </WidgetContainer>

        <WidgetContainer 
          title="Quick Actions" 
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent transition-colors">
              Approve Purchase Order #1042
            </div>
            <div className="p-3 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent transition-colors">
              Restock "Dell Latitude 5420"
            </div>
            <div className="p-3 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent transition-colors">
              Assign Macbook Pro to John Doe
            </div>
          </div>
        </WidgetContainer>
      </div>
    </div>
  );
};
