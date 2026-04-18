import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const CookieRow = ({ nombre, tipo, proposito, duracion }) => (
  <div style={s.cookieRow}>
    <div style={s.cookieCell}><code style={s.code}>{nombre}</code></div>
    <div style={s.cookieCell}><span style={s.tipoBadge}>{tipo}</span></div>
    <div style={{ ...s.cookieCell, flex: 2 }}><span style={s.cookieText}>{proposito}</span></div>
    <div style={s.cookieCell}><span style={s.cookieText}>{duracion}</span></div>
  </div>
);

const CookiesPage = () => (
  <div style={s.page}>
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.iconWrap}>
          <Cookie size={28} strokeWidth={1.5} color="#2563eb" />
        </div>
        <div>
          <h1 style={s.title}>Política de Cookies</h1>
          <p style={s.meta}>Última actualización: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} · SWRCRG</p>
        </div>
      </div>

      <div style={s.notice}>
        Esta política se enmarca en la <strong>Ley 1581 de 2012</strong> de Protección de Datos Personales y las directrices de la Superintendencia de Industria y Comercio (SIC) de Colombia sobre el uso de tecnologías de rastreo en plataformas digitales.
      </div>

      <Section title="1. ¿Qué son las Cookies?">
        <p style={s.p}>
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita una plataforma web. Permiten que la plataforma recuerde sus preferencias y acciones durante un período de tiempo, mejorando su experiencia de uso. Existen también tecnologías similares como el <em>localStorage</em> y el <em>sessionStorage</em>, que cumplen funciones análogas.
        </p>
      </Section>

      <Section title="2. Cookies y Almacenamiento Local que Utilizamos">
        <p style={s.p}>SWRCRG utiliza un número mínimo de mecanismos de almacenamiento, todos estrictamente necesarios para el funcionamiento de la plataforma:</p>

        <div style={s.tableWrap}>
          <div style={s.tableHeader}>
            <div style={s.cookieCell}><strong>Nombre</strong></div>
            <div style={s.cookieCell}><strong>Tipo</strong></div>
            <div style={{ ...s.cookieCell, flex: 2 }}><strong>Propósito</strong></div>
            <div style={s.cookieCell}><strong>Duración</strong></div>
          </div>
          <CookieRow
            nombre="token"
            tipo="Esencial"
            proposito="Almacena el token JWT de autenticación para mantener la sesión del usuario activa."
            duracion="Sesión / hasta cierre de sesión"
          />
          <CookieRow
            nombre="user"
            tipo="Esencial"
            proposito="Almacena información básica del perfil del usuario (nombre, rol) para personalizar la interfaz sin consultas adicionales al servidor."
            duracion="Sesión / hasta cierre de sesión"
          />
          <CookieRow
            nombre="theme"
            tipo="Preferencia"
            proposito="Guarda la preferencia de tema visual (claro u oscuro) seleccionada por el usuario."
            duracion="Persistente (hasta que el usuario la cambie)"
          />
        </div>

        <p style={s.p} style={{ marginTop: '16px', fontSize: '14px', color: 'var(--c-text-3)' }}>
          Nota: Los elementos <code style={s.code}>token</code> y <code style={s.code}>user</code> se almacenan en <strong>localStorage</strong> del navegador, no como cookies HTTP tradicionales. El elemento <code style={s.code}>theme</code> también usa localStorage.
        </p>
      </Section>

      <Section title="3. Cookies de Terceros">
        <p style={s.p}>
          SWRCRG utiliza <strong>OpenStreetMap</strong> y <strong>CartoDB</strong> para la visualización de mapas interactivos. Estos servicios pueden establecer sus propias cookies o mecanismos de rastreo cuando el mapa se carga en su navegador. Le recomendamos consultar las políticas de privacidad de estos proveedores:
        </p>
        <ul style={s.list}>
          <li><a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer" style={s.link}>Política de privacidad de OpenStreetMap</a></li>
          <li><a href="https://carto.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Política de privacidad de CARTO</a></li>
        </ul>
        <p style={s.p}>
          SWRCRG no utiliza cookies de publicidad, seguimiento de comportamiento entre sitios, ni herramientas de analítica de terceros (como Google Analytics).
        </p>
      </Section>

      <Section title="4. Base Legal">
        <p style={s.p}>
          El uso de cookies y almacenamiento local estrictamente necesarios para el funcionamiento de la plataforma se fundamenta en el <strong>interés legítimo</strong> de prestar el servicio solicitado por el usuario, conforme a los principios de la Ley 1581 de 2012. Las cookies de preferencia (tema visual) se basan en el consentimiento implícito del usuario al realizar la acción de cambio de tema.
        </p>
        <p style={s.p}>
          No utilizamos cookies que requieran consentimiento explícito previo (cookies de publicidad o analítica de terceros), por lo que no implementamos un banner de consentimiento de cookies, en coherencia con el principio de minimización de datos.
        </p>
      </Section>

      <Section title="5. Sus Derechos y Control sobre las Cookies">
        <p style={s.p}>Usted tiene control total sobre el almacenamiento local de su navegador:</p>
        <ul style={s.list}>
          <li><strong>Cerrar sesión</strong> desde la plataforma elimina automáticamente los datos de autenticación (<code style={s.code}>token</code> y <code style={s.code}>user</code>).</li>
          <li>Puede <strong>limpiar el almacenamiento local</strong> de su navegador en cualquier momento desde la configuración del mismo (Herramientas de desarrollador → Application → Local Storage).</li>
          <li>Puede <strong>bloquear cookies de terceros</strong> desde la configuración de privacidad de su navegador, aunque esto puede afectar la visualización de los mapas.</li>
          <li>La mayoría de navegadores modernos permiten gestionar, bloquear o eliminar cookies de forma granular.</li>
        </ul>
      </Section>

      <Section title="6. Instrucciones por Navegador">
        <p style={s.p}>Para gestionar cookies en los principales navegadores:</p>
        <ul style={s.list}>
          <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio.</li>
          <li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies.</li>
          <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web.</li>
        </ul>
      </Section>

      <Section title="7. Actualizaciones de esta Política">
        <p style={s.p}>
          Esta política puede ser actualizada para reflejar cambios en las tecnologías utilizadas o en la normativa aplicable. Le notificaremos cualquier cambio relevante a través de la plataforma. La fecha de última actualización siempre estará visible en la parte superior de este documento.
        </p>
      </Section>

      <div style={s.footer}>
        <Link to="/privacidad" style={s.footerLink}>Política de Privacidad</Link>
        <span style={s.dot}>·</span>
        <Link to="/terminos" style={s.footerLink}>Términos y Condiciones</Link>
        <span style={s.dot}>·</span>
        <Link to="/" style={s.footerLink}>Volver al inicio</Link>
      </div>

    </div>
  </div>
);

const s = {
  page:         { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  container:    { maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' },
  header:       { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' },
  iconWrap:     { width: '52px', height: '52px', borderRadius: '12px', background: 'var(--c-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' },
  title:        { fontSize: '26px', fontWeight: '800', color: 'var(--c-text)', margin: '0 0 6px', lineHeight: '1.2' },
  meta:         { fontSize: '13px', color: 'var(--c-text-3)', margin: 0 },
  notice:       { background: 'var(--c-primary-bg)', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6', marginBottom: '36px' },
  section:      { marginBottom: '32px' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: 'var(--c-text)', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid var(--c-border)' },
  p:            { fontSize: '15px', color: 'var(--c-text-2)', lineHeight: '1.75', margin: '0 0 10px' },
  list:         { paddingLeft: '20px', margin: '8px 0 10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: 'var(--c-text-2)', lineHeight: '1.6' },
  link:         { color: '#2563eb', fontWeight: '600' },
  tableWrap:    { border: '1px solid var(--c-border)', borderRadius: '10px', overflow: 'hidden', marginTop: '12px' },
  tableHeader:  { display: 'flex', gap: '0', background: 'var(--c-bg)', padding: '10px 16px', borderBottom: '1px solid var(--c-border)', fontSize: '13px', color: 'var(--c-text)' },
  cookieRow:    { display: 'flex', gap: '0', padding: '12px 16px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', alignItems: 'flex-start' },
  cookieCell:   { flex: 1, paddingRight: '12px', fontSize: '13px' },
  cookieText:   { fontSize: '13px', color: 'var(--c-text-2)', lineHeight: '1.5' },
  tipoBadge:    { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: 'var(--c-primary-bg)', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.3px' },
  code:         { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px', background: 'var(--c-bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--c-text)', border: '1px solid var(--c-border)' },
  footer:       { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px', borderTop: '1px solid var(--c-border)', flexWrap: 'wrap' },
  footerLink:   { fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
  dot:          { color: 'var(--c-text-3)', fontSize: '14px' },
};

export default CookiesPage;
