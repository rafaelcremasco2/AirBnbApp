import React from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Modal } from 'react-native'; // Adicionado o Modal
import { RNCamera } from 'react-native-camera';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
    Container,
    AnnotationContainer,
    AnnotationText,
    NewButtonContainer,
    ButtonsWrapper,
    CancelButtonContainer,
    SelectButtonContainer,
    ButtonText,
    Marker,
    ModalContainer,
    ModalImagesListContainer,
    ModalImagesList,
    ModalImageItem,
    ModalButtons,
    CameraButtonContainer,
    CancelButtonText,
    ContinueButtonText,
    TakePictureButtonContainer,
    TakePictureButtonLabel,
    DataButtonsWrapper,
    MarkerContainer,
    MarkerLabel,
    Form,
    Input,
    DetailsModalFirstDivision,
    DetailsModalSecondDivision,
    DetailsModalThirdDivision,
    DetailsModalBackButton,
    DetailsModalPrice,
    DetailsModalRealtyTitle,
    DetailsModalRealtySubTitle,
    DetailsModalRealtyAddress,
} from './styles';

MapboxGL.setAccessToken('<aqui_vai_seu_token>');

export default class Main extends Component {
    static navigationOptions = {
        header: null,
    }

    state = {
        locations: [],
        newRealty: false,
        cameraModalOpened: false,
        dataModalOpened: false,
        realtyData: {
            location: {
                latitude: null,
                longitude: null,
            },
            name: '',
            price: '',
            address: '',
            images: [],
        },
    };

    handleNewRealtyPress = () =>
        this.setState({ newRealty: !this.state.newRealty })

    handleGetPositionPress = async () => {
        try {
            const [longitude, latitude] = await this.map.getCenter();
            this.setState({
                cameraModalOpened: true,
                realtyData: {
                    ...this.state.realtyData,
                    location: {
                        latitude,
                        longitude,
                    },
                },
            });
        } catch (err) {
            console.tron.log(err);
        }
    }

    getLocation = async () => {
        try {
            const response = await api.get('/properties', {
                params: {
                    latitude: -27.210768,
                    longitude: -49.644018,
                },
            });

            this.setState({ locations: response.data });
        } catch (err) {
            console.tron.log(err);
        }
    }

    componentDidMount() {
        this.getLocation();
    }

    handleTakePicture = async () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
            const data = await this.camera.takePictureAsync(options)
            const { realtyData } = this.state;
            this.setState({
                realtyData: {
                    ...realtyData,
                    images: [
                        ...realtyData.images,
                        data,
                    ]
                }
            })
        }
    }

    handleCameraModalClose = () => this.setState({ cameraModalOpened: !this.state.cameraModalOpened })

    handleDataModalClose = () => this.setState({
        dataModalOpened: !this.state.dataModalOpened,
        cameraModalOpened: false,
    })

    handleInputChange = (index, value) => {
        const { realtyData } = this.state;
        switch (index) {
            case 'name':
                this.setState({
                    realtyData: {
                        ...realtyData,
                        name: value,
                    }
                });
                break;
            case 'address':
                this.setState({
                    realtyData: {
                        ...realtyData,
                        address: value,
                    }
                });
                break;
            case 'price':
                this.setState({
                    realtyData: {
                        ...realtyData,
                        price: value,
                    }
                });
                break;
        }
    }

    saveRealty = async () => {
        try {
            const {
                realtyData: {
                    name,
                    address,
                    price,
                    location: {
                        latitude,
                        longitude
                    },
                    images
                }
            } = this.state;

            const newRealtyResponse = await api.post('/properties', {
                title: name,
                address,
                price,
                latitude: Number(latitude.toFixed(6)),
                longitude: Number(longitude.toFixed(6)),
            });

            const imagesData = new FormData();

            images.forEach((image, index) => {
                imagesData.append('image', {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: `${newRealtyResponse.data.title}_${index}.jpg`
                });
            });

            await api.post(
                `/properties/${newRealtyResponse.data.id}/images`,
                imagesData,
            );

            this.getLocation()
            this.handleDataModalClose()
            this.setState({ newRealty: false });
        } catch (err) {
            console.tron.log(err);
        }
    }

    renderImagesList = () => (
        this.state.realtyData.images.length !== 0 ? (
            <ModalImagesListContainer>
                <ModalImagesList horizontal>
                    {this.state.realtyData.images.map(image => (
                        <ModalImageItem source={{ uri: image.uri }} resizeMode="stretch" />
                    ))}
                </ModalImagesList>
            </ModalImagesListContainer>
        ) : null
    )

    renderDataModal = () => (
        <Modal
            visible={this.state.dataModalOpened}
            transparent={false}
            animationType="slide"
            onRequestClose={this.handleDataModalClose}
        >
            <ModalContainer>
                <ModalContainer>
                    <MapboxGL.MapView
                        centerCoordinate={[
                            this.state.realtyData.location.longitude,
                            this.state.realtyData.location.latitude
                        ]}
                        style={{ flex: 1 }}
                        styleURL={MapboxGL.StyleURL.Dark}
                    >
                        <MapboxGL.PointAnnotation
                            id="center"
                            coordinate={[
                                this.state.realtyData.location.longitude,
                                this.state.realtyData.location.latitude
                            ]}
                        >
                            <MarkerContainer>
                                <MarkerLabel />
                            </MarkerContainer>
                        </MapboxGL.PointAnnotation>
                    </MapboxGL.MapView>
                </ModalContainer>
                {this.renderImagesList()}
                <Form>
                    <Input
                        placeholder="Nome do Imóvel"
                        value={this.state.realtyData.name}
                        onChangeText={name => this.handleInputChange('name', name)}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Input
                        placeholder="Endereço"
                        value={this.state.realtyData.address}
                        onChangeText={address => this.handleInputChange('address', address)}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Input
                        placeholder="Preço"
                        value={this.state.realtyData.price}
                        onChangeText={price => this.handleInputChange('price', price)}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </Form>
                <DataButtonsWrapper>
                    <SelectButtonContainer onPress={this.saveRealty}>
                        <ButtonText>Salvar Imóvel</ButtonText>
                    </SelectButtonContainer>
                    <CancelButtonContainer onPress={this.handleDataModalClose}>
                        <ButtonText>Cancelar</ButtonText>
                    </CancelButtonContainer>
                </DataButtonsWrapper>
            </ModalContainer>
        </Modal>
    )

    renderCameraModal = () => (
        <Modal
            visible={this.state.cameraModalOpened}
            transparent={false}
            animationType="slide"
            onRequestClose={this.handleCameraModalClose}
        >
            <ModalContainer>
                <ModalContainer>
                    <RNCamera
                        ref={camera => {
                            this.camera = camera;
                        }}
                        style={{ flex: 1 }}
                        type={RNCamera.Constants.Type.back}
                        autoFocus={RNCamera.Constants.AutoFocus.on}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        permissionDialogTitle={"Permission to use camera"}
                        permissionDialogMessage={
                            "We need your permission to use your camera phone"
                        }
                    />
                    <TakePictureButtonContainer onPress={this.handleTakePicture}>
                        <TakePictureButtonLabel />
                    </TakePictureButtonContainer>
                </ModalContainer>
                {this.renderImagesList()}
                <ModalButtons>
                    <CameraButtonContainer onPress={this.handleCameraModalClose}>
                        <CancelButtonText>Cancelar</CancelButtonText>
                    </CameraButtonContainer>
                    <CameraButtonContainer onPress={this.handleDataModalClose}>
                        <ContinueButtonText>Continuar</ContinueButtonText>
                    </CameraButtonContainer>
                </ModalButtons>
            </ModalContainer>
        </Modal>
    )

    renderLocations = () => (
        this.state.locations.map(location => (
            <MapboxGL.PointAnnotation
                id={location.id.toString()}
                coordinate={[parseFloat(location.longitude), parseFloat(location.latitude)]}
            >
                <AnnotationContainer>
                    <AnnotationText>{location.price}</AnnotationText>
                </AnnotationContainer>
                <MapboxGL.Callout title={location.title} />
            </MapboxGL.PointAnnotation>
        ))
    )

    renderConditionalsButtons = () => (
        !this.state.newRealty ? (
            <NewButtonContainer onPress={this.handleNewRealtyPress}>
                <ButtonText>Novo Imóvel</ButtonText>
            </NewButtonContainer>
        ) : (
            <ButtonsWrapper>
                <SelectButtonContainer onPress={this.handleGetPositionPress}>
                    <ButtonText>Selecionar localização</ButtonText>
                </SelectButtonContainer>
                <CancelButtonContainer onPress={this.handleNewRealtyPress}>
                    <ButtonText>Cancelar</ButtonText>
                </CancelButtonContainer>
            </ButtonsWrapper>
        )
    )

    renderMarker = () => (
        this.state.newRealty &&
        !this.state.cameraModalOpened &&
        <Marker resizeMode="contain" source={require('../../images/marker.png')} />
    )

    render() {
        return (
            <Container>
                <StatusBar barStyle="light-content" />
                <MapboxGL.MapView
                    centerCoordinate={[-49.6446024, -27.2108001]}
                    style={{ flex: 1 }}
                    styleURL={MapboxGL.StyleURL.Dark}
                    ref={map => {
                        this.map = map;
                    }}
                >
                    {this.renderLocations()}
                </MapboxGL.MapView>
                {this.renderConditionalsButtons()}
                {this.renderMarler()}
            </Container>
        );
    }
}


Main.navigationOptions = {
    header: null,
};

Main.propTypes = {
    navigation: PropTypes.shape({
        state: PropTypes.shape({
            params: PropTypes.shape({
                token: PropTypes.string,
            }),
        }),
    }).isRequired,
};

export default Main;