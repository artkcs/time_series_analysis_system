import React, { useEffect, useState } from "react";

function IntegrationsList() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchDataForPosts = async () => {
        try {
          const response = await fetch(
            `/api/integrations`
          );
          if (!response.ok) {
            throw new Error(`HTTP error: Status ${response.status}`);
          }
          let postsData = await response.json();
          setData(postsData);
          setError(null);
        } catch (err) {
          setError(err.message);
          setData(null);
        } finally {
          setLoading(false);
        }
      };
  
      fetchDataForPosts();
    }, []);

    const integType = (type_num) => {
      if (type_num == 1) {
        return("HTTP");
      }
      else {
        return("MQTT");
      }
    }

    const integFormat = (format_num) => {
      if (format_num == 1) {
        return("JSON");
      }
      else {
        return("CSV");
      }
    }

    return (
        <div class="context-box">
            <h2 class="content-name">Integracijų sąrašas</h2>
            <table class="params-table">
                <tr class="params-table__row">
                    <th class="params-table__column params-table__column--heading column__description">Pavadinimas</th>
                    <th class="params-table__column params-table__column--heading column__description">Tipas</th>
                    <th class="params-table__column params-table__column--heading column__description">Formatas</th>
                </tr>
                {data &&
                    data.map(({ name, type, id }) => (
                        <tr class="params-table__row">
                            <td class="params-table__column column__description">
                                <a href={'/integration/' + id}> {name} </a>
                            </td>
                            <td class="params-table__column column__description">{integType(type)}</td>
                            <td class="params-table__column column__description">{integFormat(type)}</td>
                        </tr>
                    ))}
            </table>

        </div>
    );
}

export default IntegrationsList;