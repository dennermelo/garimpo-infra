exports.handler = async (event) => {
    // 1. Limpeza do Slug (remove barras e espaços extras)
    const slug = event.path.split('/').filter(Boolean).pop();
    console.log(`LOG: Iniciando busca para o slug: [${slug}]`);

    const NOCODB_API_KEY = "AZ-75uL73daFrCSd4YH-6SRzTQGXqxO4wz-3nHVF";
    const NOCODB_TABLE_URL = "https://noco-nocodb.wewdsc.easypanel.host/api/v1/db/data/v1/p3avirysfwsticf/mf22l7zpcov4sda"; 

    try {
        // IMPORTANTE: Verifique se no NocoDB a coluna é 'slug' (minúsculo) ou 'Slug' (Maiúsculo)
        // No seu código anterior estava 'slug'. Vou manter como você mandou.
        const response = await fetch(`${NOCODB_TABLE_URL}?where=(slug,eq,${slug})`, {
            method: 'GET',
            headers: { 'xc-token': NOCODB_API_KEY }
        });

        const data = await response.json();
        const registro = data.list && data.list[0];

        if (registro) {
            // Verificando se a coluna URL_Original existe e tem conteúdo
            const targetUrl = registro.URL_Original;
            const rowId = registro.id;

            console.log(`LOG: Registro encontrado! ID: ${rowId} | Redirecionando para: ${targetUrl}`);

            if (!targetUrl) {
                console.log("LOG ERRO: A coluna URL_Original está vazia no NocoDB!");
                return { statusCode: 200, body: "Erro: Link de destino vazio no banco de dados." };
            }

            // 2. Avisa o n8n (sem travar o redirecionamento)
            fetch('https://seu-n8n.host/webhook/registrar-clique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rowId, slug, timestamp: new Date().toISOString() })
            }).catch(() => {});

            // 3. Redirecionamento
            return {
                statusCode: 302,
                headers: { 
                    'Location': targetUrl,
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                },
                body: '', // 302 não precisa de corpo
            };
        }

        console.log(`LOG: Nenhum registro encontrado para o slug: ${slug}`);
        return { statusCode: 404, body: "Link não encontrado no Garimpo da Pesca." };

    } catch (error) {
        console.error("LOG ERRO CRÍTICO:", error.message);
        return { statusCode: 500, body: "Erro de conexão com o banco de dados." };
    }
};