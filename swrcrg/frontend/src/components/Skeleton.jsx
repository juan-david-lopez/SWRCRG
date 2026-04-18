const Skeleton = ({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    ...style,
  }} />
);

// Card skeleton para listas de reportes
export const ReportCardSkeleton = () => (
  <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
    <Skeleton height="220px" borderRadius="0" />
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height="20px" width="70%" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="85%" />
      <Skeleton height="12px" width="40%" />
    </div>
  </div>
);

// Skeleton para filas de tabla/lista
export const RowSkeleton = () => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton height="18px" width="40%" />
      <Skeleton height="22px" width="80px" borderRadius="20px" />
    </div>
    <Skeleton height="14px" />
    <Skeleton height="14px" width="60%" />
  </div>
);

export default Skeleton;
