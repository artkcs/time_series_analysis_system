import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form";
import { commonErrorMsg } from "./UIMessages";


function AddHttpIntegration() {
    const { register, control, handleSubmit } = useForm({
        defaultValues: {
        type: 1,
        data_type: 1,
        integ_fields: [],
        integ_name: "",
        integ_url: "",
        integ_periodicity: 0,
        integ_date_field : "",
        json_path: ""
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'integ_fields',
    });

    const navigate = useNavigate();

    const [dataFormat, setDataFormat] = useState(1);

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

  
    const onSubmit = data => {
        let validationResult = validateFields(data)
        if (validationResult) {
            let errMsg = commonErrorMsg(validationResult)
            let errMsgBox = document.getElementById("info-message")
            errMsgBox.innerHTML = ""
            errMsgBox.appendChild(errMsg)
        }
        else {
            const requestOptions = {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({
                    type: data.type,
                    data_type: dataFormat,
                    name: data.integ_name,
                    http_url: data.integ_url,
                    periodicity: data.integ_periodicity,
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
                        let errMsg = commonErrorMsg("Klaida apdorojant integracijos užklausą!")
                        let errMsgBox = document.getElementById("info-message")
                        errMsgBox.innerHTML = ""
                        errMsgBox.appendChild(errMsg)
                        return null
                    }
                })
                .then((data) => {
                    if (data) {
                        navigate(`/integration/${data.id}`, {state:{new: "true"}})
                    }
                })
        }
    };

    const validateFields = (data) => {
        let validationErrors = ""
        if (!data.integ_name) {
            validationErrors += "Integracijos pavadinimas negali būti tuščias!"
        }
        if (!data.integ_url) {
            validationErrors += "\nIntegracijos URL negali būti tuščias!"
        }
        if (data.integ_periodicity <= 0) {
            validationErrors += "\nPeriodiškumas turi būti teigiamas skaičius!"
        }
        if (!data.integ_date_field) {
            validationErrors += "\nDatos laukas negali būti tuščias!"
        }
        if (data.integ_fields.length < 1) {
            validationErrors += "\nIntegracija turi turėti bent 1 laukelį!"
        }

        return validationErrors
    }
  
    return (
        <div class="context-box">
            <h2 class="content-name">Pridėti integraciją</h2>
            <div id="info-message"></div>
            <div class="form-wrapper">
                <form class="form" onSubmit={handleSubmit(onSubmit)}>
                    <label class="label">Pavadinimas:</label>
                    <input class="field field__block" type="text" id="integration_name" name="integration_name" {...register("integ_name")} />
                    <label class="label">URL (HTTP/HTTPS):</label>
                    <input class="field field__block" type="text" id="url" name="url" {...register("integ_url")}/>
                    <label class="label">Atnaujinimo periodiškumas (val.):</label>
                    <input class="field field__block" type="number" id="periodicity" {...register("integ_periodicity")}/>
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

export default AddHttpIntegration;