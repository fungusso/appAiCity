import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, StatusBar, TextInput, Platform, Pressable, ScrollView,
  ActivityIndicator, Alert, Keyboard, BackHandler
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
/*require('dotenv').config() */

const statusBarHeight = StatusBar.currentHeight
/*const KEY_GPT:  string = (process.env.REACT_APP_KEY_GPT as string)*/
const KEY_GPT = process.env.EXPO_PUBLIC_KEY_GPT;
/*const KEY_GPT =`${process.env.REACT_APP_KEY_GPT}`;*/
/*console.log(`o tempo foi ${KEY_GPT} ms`);*/
export default function Index() {
    const [city, setCity] = useState("");
    const [days, setDays] = useState(3);
    const [loading, setLoading] = useState(false);
    const [travel, setTravel] = useState("")
    var emoji = String.fromCodePoint(128516)

  async function handleGenerate() {

      if (city === "") {
        Alert.alert("Atenção", "Preencha o nome da cidade!")
        return;
      }
/*  limpa antes de uma nova consulta*/
      setTravel("")
/*  seta a rodinha giratória para a nova consulta*/
      setLoading(true);
      Keyboard.dismiss();

      const prompt = `Crie um roteiro para uma viagem de exatos ${days.toFixed(0)} dias na cidade de ${city}, busque por lugares turisticos, lugares mais visitados, seja preciso nos dias de estadia fornecidos e limite o roteiro apenas na cidade fornecida. Forneça apenas em tópicos com nome do local com a latitude e longitude e onde ir em cada dia.`
/*    const prompt = `Crie uma lista de discos de exatos ${days.toFixed(0)} discos da banda ${city}, busque por melhores discos, vendagem, apenas da banda solicitada. Forneça apenas os titulos dos discos em tópicos.`*/
      const apiUrl = "https://api.openai.com/v1/chat/completions";

        // Corpo da requisição
      const requestBody = {
          model: "gpt-4o-mini", // ou o modelo desejado, como "gpt-3.5-turbo"
          messages: [
                {
                        "role": "user",
                        "content": prompt
                        }
              ],
          temperature: 0.7, // Ajuste conforme necessário
          max_tokens: 500,
          top_p: 1,
      };

      try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${KEY_GPT}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`Erro: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
/*          console.log("Resposta da API:", data); */
          setTravel(data.choices[0].message.content)
      } catch (error) {
          console.error("Erro ao acessar a API:", error);
        }
        finally {
            setLoading(false);
        }

  }
  async function handleCopyToClipboard() {
      if (travel === "") {
          Alert.alert("Atenção", "Não há conteúdo para copiar!!")
          return;
      } else {
            await Clipboard.setStringAsync(travel);
/*         Alert.alert("Roteiro copiado!!!!") */
      }
  }
/* reincia o app */
  async function reloadApp () {
      await Updates.reloadAsync();
  }
/* escuta o conteúdo para poder ser copiado */
  useEffect(() => {
      const subscription = Clipboard.addClipboardListener(() =>{
          Alert.alert('Copiado!! Já pode colar !!!')
          });
      return () => Clipboard.removeClipboardListener(subscription);
  },[]);

  return (
/*  botôes , sair, gerar roteiro, copiar roteiro e reiniciar  através da tag Pressable */
      <View style={styles.container}>

        <Pressable style={styles.buttonExit} onPress={() => BackHandler.exitApp()}>
                         <Text style={styles.buttonTextExit}></Text>
                         <MaterialCommunityIcons name="exit-to-app" size={24} color="black" />
        </Pressable>

        <StatusBar barStyle="dark-content" translucent={true} backgroundColor="#F1F1F1" />
        <Text style={styles.heading}>Roteiros de Viagens</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Cidade Destino</Text>
          <TextInput
            placeholder="Digite o destino,Ex: Curitiba, Pr"
            style={styles.input}
            value={city}
            onChangeText={(text) => setCity(text)}
          />

          <Text style={styles.label}>Tempo de Estadia: <Text style={styles.days}> {days.toFixed(0)} </Text> dias</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            minimumTrackTintColor="#002396"
            maximumTrackTintColor="#000000"
            value={days}
            onValueChange={(value) => setDays(value)}
          />
        </View>
        <View style={styles.fixToText}>

             <Pressable style={styles.button} onPress={handleGenerate}>
                 <Text style={styles.buttonText}></Text>
                 <MaterialCommunityIcons name="wallet-travel" size={24} color="#3d7d6d" />
             </Pressable>

             <Pressable style={styles.buttonCopy} onPress={() => handleCopyToClipboard()}>
                  <Text style={styles.buttonTextCopy}></Text>
                  <MaterialCommunityIcons name="content-copy" size={24} color="#3d7d6d" />
             </Pressable>

             <Pressable style={styles.buttonReload} onPress={() => reloadApp()}>
                   <Text style={styles.buttonTextReload}></Text>
                   <MaterialCommunityIcons name="restart" size={24} color="#3d7d6d" />
             </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24, marginTop: 4, }} style={styles.containerScroll} showsVerticalScrollIndicator={false} >
          {loading && (
            <View style={styles.content}>
              <Text style={styles.title}>Carregando Roteiro...</Text>
              <ActivityIndicator color="#000" size="large" />
            </View>
          )}

          {travel && (
            <View style={styles.content}>
              <Text style={styles.title}>Roteiro da Viagem Uhuuuuuuu!!{emoji} </Text>
              <Text style={{ lineHeight: 24, }}>{travel}</Text>
            </View>
          )}
        </ScrollView>

      </View>
    );
}

const styles = StyleSheet.create({
/*  Styles obs: permanecem os buttonText , para uso nos textos dos botões */
    container: {
      flex: 1,
      backgroundColor: '#f1f1f1',
      alignItems: 'center',
      paddingTop: 20,
    },
    heading: {
      fontSize: 32,
      color: '#67b868',
      fontWeight: 'bold',
      paddingTop: Platform.OS === 'android' ? statusBarHeight : 54
    },
    form: {
      backgroundColor: '#FFF',
      width: '90%',
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    label: {
      fontWeight: 'bold',
      color: '#87cc6e',
      fontSize: 18,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 4,
      borderColor: '#3cc724',
      color: '#9c9a54',
      padding: 8,
      fontSize: 16,
      marginBottom: 16,
    },
    days: {
      backgroundColor: '#F1f1f1'
    },
    button: {
    /*  backgroundColor: '#97ff56', */
      width: '20%',
      borderRadius: 8,
      flexDirection: 'row',
      padding: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    buttonCopy: {
    /*  backgroundColor: '#6fb0de', */
      width: '20%',
      borderRadius: 8,
      flexDirection: 'row',
      padding: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    buttonReload: {
    /*  backgroundColor: '#6fdea3', */
      width: '20%',
      borderRadius: 8,
      flexDirection: 'row',
      padding: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    buttonExit: {
    /*  backgroundColor: '#6fdea3', */
      width: '90%',
      borderRadius: 8,
      padding: 5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      textAlign: 'right',
      gap: 8,
    },
    buttonText: {
      fontSize: 18,
      color: '#858c6c',
      fontWeight: 'bold'
    },
    buttonTextCopy: {
      fontSize: 18,
      color: '#f7f0f0',
      fontWeight: 'bold'
    },
    buttonTextReload: {
      fontSize: 18,
      color: '#f7f0f0',
      fontWeight: 'bold'
    },
    buttonTextExit: {
      fontSize: 18,
      color: '#5e805d',
      fontWeight: 'bold'
    },
    content: {
      backgroundColor: '#FFF',
      padding: 16,
      width: '100%',
      marginTop: 16,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 14
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    containerScroll: {
      backgroundColor: '#FFF',
      width: '90%',
      marginTop: 8,
    }
  });


