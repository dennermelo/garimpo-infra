const axios = require('axios');

exports.handler = async (event) => {
    const slug = event.path.split('/').pop();
    
    // Configurações Validadas
    const NOCODB_API_KEY = "AZ-75uL73daFrCSd4YH-6SRzTQGXqxO4wz-3nHVF";
    const NOCODB_TABLE_URL = "https://noco-nocodb.wewdsc.easypanel.host/api/v1/db/data/v1/p3avirysfwsticf/mf22l7zpcov4sda"; 

    try {
        // 1. Busca a URL original no NocoDB filtrando pelo Slug
        const response = await axios.get(`${NOCODB_TABLE_URL}?where=(Slug,eq,${slug})`, {
            headers: { 'xc-token': NOCODB_API_KEY }
        });

        const registro = response.data.list && response.data.list[0];

        if (registro) {
            const targetUrl = registro.URL_Original;
            const rowId = registro.id;

            // 2. Avisa o n8n (Troque pela sua URL de Webhook do n8n se já tiver)
            axios.post('https://seu-n8n.host/webhook/registrar-clique', {
                rowId: rowId,
                slug: slug,
                timestamp: new Date().toISOString()
            }).catch(e => console.error("Erro n8n silencioso"));

            // 3. Redirecionamento instantâneo
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
        console.error("Erro técnico:", error.message);
        return { statusCode: 500, body: "Erro na conexão com o banco de dados." };
    }
};