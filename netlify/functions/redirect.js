exports.handler = async (event) => {
    const slug = event.path.split('/').pop();
    
    // Configurações Validadas
    const NOCODB_API_KEY = "AZ-75uL73daFrCSd4YH-6SRzTQGXqxO4wz-3nHVF";
    const NOCODB_TABLE_URL = "https://noco-nocodb.wewdsc.easypanel.host/api/v1/db/data/v1/p3avirysfwsticf/mf22l7zpcov4sda"; 

    try {
        // 1. Busca no NocoDB usando o FETCH nativo (padrão em 2026)
        const response = await fetch(`${NOCODB_TABLE_URL}?where=(slug,eq,${slug})`, {
            method: 'GET',
            headers: { 'xc-token': NOCODB_API_KEY }
        });

        const data = await response.json();
        const registro = data.list && data.list[0];

        if (registro) {
            const targetUrl = registro.URL_Original;
            const rowId = registro.id;

            // 2. Avisa o n8n (Troque pela sua URL de Webhook do n8n)
            fetch('https://seu-n8n.host/webhook/registrar-clique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rowId, slug, timestamp: new Date().toISOString() })
            }).catch(() => {}); // Silencioso se falhar

            // 3. Redirecionamento 302
            return {
                statusCode: 302,
                headers: { 
                    'Location': targetUrl,
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                },
                body: '',
            };
        }

        return { statusCode: 404, body: "Link não encontrado no Garimpo." };

    } catch (error) {
        return { statusCode: 500, body: "Erro de conexão com o banco." };
    }
};