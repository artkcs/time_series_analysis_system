import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";


function AddMqttIntegration() {
    const { register, control, handleSubmit } = useForm({
        defaultValues: {
        type: 2,
        data_type: 1,
        integ_fields: [],
        integ_name: "",
        mqtt_broker: "",
        mqtt_topic: "",
        mqtt_port: "",
        integ_date_field : "",
        json_path: ""
        },
        });
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'integ_fields',
    });

    const [dataFormat, setDataFormat] = useState(1);

  
    const onSubmit = data => {
        const requestOptions = {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                type: data.type,
                data_type: dataFormat,
                name: data.integ_name,
                mqtt_broker: data.mqtt_broker,
                mqtt_topic: data.mqtt_topic,
                mqtt_port: data.mqtt_port,
                integ_date_field: data.integ_date_field,
                dateformat: data.integ_date_format,
                integ_fields: data.integ_fields,
                json_path: data.json_path,
                integ_format: data.integ_format
            })
        };
        
        fetch("/api/add-integration", requestOptions)
        .then((response) => {
            if (response.status === 201) {
                return response.json()
            }
            else {
                return null
            }
        })
        .then((data) => {
            if (data) {
                navigate(`/integration/${data.id}`, {state:{new: "true"}})
            }
        })
    };

    const jsonPathVisibility = (event) => {
        setDataFormat(event.target.value);
        let addJsonPathLabel = document.getElementById("json-path-label");
        let additionalJsonPath = document.getElementById("json_path")
        if (event.target.value === "json") {
            additionalJsonPath.style.display = "block";
            addJsonPathLabel.style.display = "block";
        }
        else {
            additionalJsonPath.style.display = "none";
            addJsonPathLabel.style.display = "none";
        }
    };
  
    return (
        <div class="context-box">
            <h2 class="content-name">Pridėti integraciją</h2>
            <div id="info-message"></div>
            <div class="form-wrapper">
                <form class="form" onSubmit={handleSubmit(onSubmit)}>
                    <label class="label">Pavadinimas:</label>
                    <input class="field field__block" type="text" id="integration_name" name="integration_name" {...register("integ_name")} />
                    <label class="label">Broker:</label>
                    <input class="field field__block" type="text" id="broker" name="broker" {...register("mqtt_broker")}/>
                    <label class="label">Topic:</label>
                    <input class="field field__block" type="text" id="topic" name="topic" {...register("mqtt_topic")}/>
                    <label class="label">Port (Prievadas):</label>
                    <input class="field field__block" type="text" id="port" name="port" {...register("mqtt_port")}/>
                    <label class="label">Datos lauko pavadinimas:</label>
                    <input class="field field__block" type="text" id="datefieldname" {...register("integ_date_field")}/>
                    <label class="label">Datos formatas:</label>
                    <input class="field field__block" type="text" placeholder="example: %Y-%m-%d %H:%M:%S" id="dateformat" {...register("integ_date_format")}/>
                    <label class="label">Duomenų formatas:</label>
                    <select class="field field__block" onChange={jsonPathVisibility} value={dataFormat}>
                                <option value="1">JSON</option>
                                <option value="2">CSV</option>
                    </select>
                    <label class="label" id="json-path-label">Papildomas JSON kelias:</label>
                    <input class="field field__block" type="text" placeholder="example: element1/element2..." id="json_path" {...register("json_path")}/>

                    {fields.map((field, index) => {
                    const fieldName = `friends[${index}]`;
                    return (
                        <fieldset class="fieldset" name={field.id} key={field.id}>
                        <div class="inline-field-container">
                            <label class="label label__inline">
                                Pavadinimas:
                            </label>
                            <input
                            class="field field__inline"
                            type="text"
                            //name={`${fieldName}.firstName`}
                            {...register(`integ_fields.${index}.field_name`)}
                            />
                        </div>
                        <div class="inline-field-container">
                            <label class="label label__inline">
                                Pavadinimas integracijoje:
                                </label>
                            <input class="field field__inline"
                            type="text"
                            //name={`${fieldName}.lastName`}
                            {...register(`integ_fields.${index}.field_integ_name`)}
                            />
                        </div>
                        <div class="inline-field-container">
                            <label class="label label__inline">
                                Tipas:
                                </label>
                            <select class="field field__inline" {...register(`integ_fields.${index}.field_integ_type`)}>
                                <option value="text">Tekstas</option>
                                <option value="number">Skaičius</option>
                                <option value="date">Data</option>
                            </select>
                            
                        </div>
                        <button class="button" type="button" onClick={() => remove(index)}>
                            Pašalinti
                        </button>
                        </fieldset>
                    );
                    })}
            
                        <button class="button" type="button" onClick={() => append({field_name: "", field_integ_name: "", field_integ_type: ""})}>
                        Pridėti laukelį
                        </button>
                        <input class="button" type="submit" value="Registruoti" />
                </form>
            </div>
        </div>
    );
}

export default AddMqttIntegration;